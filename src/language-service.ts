import {
	Logger,
	TemplateContext,
	TemplateLanguageService,
} from "typescript-template-language-service-decorator";
import * as ts from "typescript/lib/tsserverlibrary";
import { Analysis, analyze, ParseError } from "./analysis";
import { Parameter } from "./analysis/params";
import { pluginName } from "./config";
import { ParsedPluginConfiguration } from "./configuration";
import { formatText } from "./formatting";
import { DatabaseSchema, ColumnDefinition } from "./schema";
import { TypeChecker } from "./type-checker";
import { TypeResolver } from "./type-resolver";
import { flatten } from "./utils";

const diagnosticMessageCodes = [100_000, 100_001, 100_002, 100_003] as const;
type DiagnosticMessageCode = typeof diagnosticMessageCodes[number];

interface DiagnosticMessage {
	messageText: (arg: any) => string;
	category: keyof typeof ts.DiagnosticCategory;
}

const diagnosticMessages: Record<DiagnosticMessageCode, DiagnosticMessage> = {
	100_000: {
		messageText: (e: Error) => `Failed to parse: ${e.message}.`,
		category: "Error",
	},
	100_001: {
		messageText: (e: ParseError) => `Failed to parse: ${e.message}.`,
		category: "Error",
	},
	100_002: {
		messageText: (p: Parameter) =>
			`Cannot find type for parameter ${stringifyParameter(
				p
			)} in schema.`,
		category: "Error",
	},
	100_003: {
		messageText: (originalMessage: string) =>
			`There was an issue type checking this expression. Original error: ${originalMessage}`,
		category: "Warning",
	},
};

const unsupportedTypeScriptErrors = new Set([
	// "Cannot find name '{0}'."
	// The plugin tries to resolve all type names and create a literal type.
	// This type is then checked against the type from the DB schema. If we get
	// this error, it most likely means not all type names were resolved
	// correctly.
	2304,
]);

const getTemplateExpressions = (
	typescript: typeof ts,
	node: ts.TemplateLiteral
) =>
	typescript.isTemplateExpression(node)
		? node.templateSpans.map((span) => span.expression)
		: [];

const stringifyParameter = (parameter: Parameter): string =>
	[
		parameter.usedWith.schema,
		parameter.usedWith.table,
		parameter.usedWith.column,
		parameter.usedWith.jsonPath && parameter.usedWith.jsonPath.path,
	]
		.filter((x) => x)
		.join(".");

const getParameterType = (
	parameter: Parameter,
	schemaJson: DatabaseSchema,
	defaultSchemaName: string
): ColumnDefinition | undefined => {
	const schema = parameter.usedWith.schema || defaultSchemaName;
	const dbSchema = schemaJson[schema];
	const dbTable = dbSchema && dbSchema[parameter.usedWith.table];
	const dbColumn = dbTable && dbTable[parameter.usedWith.column];
	if (dbColumn) {
		const type =
			parameter.usedWith.jsonPath && parameter.usedWith.jsonPath.isText
				? "string | null"
				: dbColumn;
		return parameter.usedWith.isArray ? `Array<${type}>` : type;
	}
};

const getDiagnosticFactory = (context: TemplateContext) => {
	const file = context.node.getSourceFile();
	const source = pluginName;

	const any = ({
		code,
		messageText,
		category,
		start,
		length,
	}: Pick<
		ts.Diagnostic,
		"code" | "messageText" | "category" | "start" | "length"
	>): ts.Diagnostic => ({
		code,
		messageText,
		category,
		start,
		length,
		file,
		source,
	});

	const own = (
		code: DiagnosticMessageCode,
		arg: any,
		pos: Pick<ts.Diagnostic, "start" | "length">
	) =>
		any({
			code,
			messageText: diagnosticMessages[code].messageText(arg),
			category:
				context.typescript.DiagnosticCategory[
					diagnosticMessages[code].category
				],
			...pos,
		});

	const pos = (expression: ts.Expression) => ({
		start: expression.getStart(file) - context.node.getStart(file) - 1,
		length: expression.getWidth(file),
	});

	return {
		any,
		own,
		pos,
	};
};

export default class SqlTemplateLanguageService
	implements TemplateLanguageService {
	constructor(
		private readonly logger: Logger,
		private readonly config: ParsedPluginConfiguration,
		private readonly typeChecker: TypeChecker,
		private readonly typeResolver: TypeResolver
	) {}

	getSemanticDiagnostics(context: TemplateContext): ts.Diagnostic[] {
		if (!this.config.enableDiagnostics) {
			return [];
		}

		const factory = getDiagnosticFactory(context);

		let analysis: Analysis;
		try {
			analysis = analyze(context.text);
		} catch (e) {
			return e instanceof ParseError
				? [
						factory.own(100_001, e, {
							start: e.cursorPosition - 1,
							length: 1,
						}),
				  ]
				: [
						factory.own(100_000, e, {
							start: 0,
							length: context.text.length,
						}),
				  ];
		}

		for (const warning of analysis.warnings) {
			this.logger.log(
				`Warning analyzing template in file ${context.fileName}: ${warning}`
			);
		}

		const schema = this.config.schema;
		if (!schema) {
			this.logger.log("skip type checks because no schema configured");
			return [];
		}

		const expressions = getTemplateExpressions(
			context.typescript,
			context.node
		);
		const diagnostics = analysis.parameters
			.filter((parameter) => expressions.length >= parameter.index)
			.map((parameter) => ({
				expression: expressions[parameter.index - 1],
				parameter,
			}))
			.map(({ expression, parameter }) => {
				const parameterType = getParameterType(
					parameter,
					schema,
					this.config.defaultSchemaName
				);
				if (!parameterType) {
					return [
						factory.own(
							100_002,
							parameter,
							factory.pos(expression)
						),
					];
				}

				const expressionType = this.typeResolver.getType(expression);
				const content = `{ let expr: ${expressionType} = null as any; let param: ${parameterType} = expr; }`;
				return this.typeChecker.check(content).map((diagnostic) =>
					unsupportedTypeScriptErrors.has(diagnostic.code)
						? factory.own(
								100_003,
								diagnostic.messageText,
								factory.pos(expression)
						  )
						: factory.any({
								code: diagnostic.code,
								messageText: diagnostic.messageText,
								category: diagnostic.category,
								...factory.pos(expression),
						  })
				);
			});

		return flatten(diagnostics);
	}

	getFormattingEditsForRange(
		context: TemplateContext,
		start: number,
		end: number,
		settings: ts.EditorSettings
	): ts.TextChange[] {
		if (!this.config.enableFormat) {
			return [];
		}

		const text = context.text.substring(start, end);
		try {
			const newText = formatText(
				text,
				settings.convertTabsToSpaces
					? {
							style: "spaces",
							number: settings.indentSize ?? 4,
					  }
					: { style: "tabs" }
			);
			if (newText !== text) {
				return [
					{
						span: { start, length: end - start },
						newText,
					},
				];
			}
		} catch (e) {
			this.logger.log(`error running pgFormatter: ${e.message}`);
		}

		return [];
	}
}
