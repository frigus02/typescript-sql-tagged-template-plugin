import {
	Logger,
	TemplateContext,
	TemplateLanguageService
} from "typescript-template-language-service-decorator";
import * as ts from "typescript/lib/tsserverlibrary";
import { pluginName } from "./config";
import { Analysis, analyze, ParseError } from "./analysis";
import { Parameter } from "./analysis/params";
import { TypeChecker } from "./type-checker";
import { DatabaseSchema, ColumnDefinition } from "./schema";
import { flatten } from "./utils";
import { ParsedPluginConfiguration } from "./configuration";

const diagnosticMessageCodes = [100_000, 100_001, 100_002, 100_003] as const;
type DiagnosticMessageCode = typeof diagnosticMessageCodes[number];

interface DiagnosticMessage {
	messageText: (arg: any) => string;
	category: keyof typeof ts.DiagnosticCategory;
}

const diagnosticMessages: Record<DiagnosticMessageCode, DiagnosticMessage> = {
	100_000: {
		messageText: (e: Error) => `Failed to parse: ${e.message}.`,
		category: "Error"
	},
	100_001: {
		messageText: (e: ParseError) => `Failed to parse: ${e.message}.`,
		category: "Error"
	},
	100_002: {
		messageText: (p: Parameter) =>
			`Cannot find type for parameter ${stringifyParameter(p)} in schema.`,
		category: "Error"
	},
	100_003: {
		messageText: () =>
			`Type checking is not supported for this expression, yet.`,
		category: "Warning"
	}
};

const unsupportedTypeScriptErrors = new Set<number>([
	// "Cannot find name '{0}'."
	// This happens when the type of the template expression is an interface. I
	// have not figured out how to do assignment checks for interfaces, yet.
	2304
]);

const getTemplateExpressions = (node: ts.TemplateLiteral) =>
	ts.isTemplateExpression(node)
		? node.templateSpans.map(span => span.expression)
		: [];

const stringifyParameter = (parameter: Parameter): string =>
	[
		parameter.schema,
		parameter.table,
		parameter.column,
		parameter.jsonPath && parameter.jsonPath.path
	]
		.filter(x => x)
		.join(".");

const getParameterType = (
	parameter: Parameter,
	schemaJson: DatabaseSchema,
	defaultSchemaName: string
): ColumnDefinition | undefined => {
	const schema = parameter.schema || defaultSchemaName;
	const dbSchema = schemaJson[schema];
	const dbTable = dbSchema && dbSchema[parameter.table];
	const dbColumn = dbTable && dbTable[parameter.column];
	if (dbColumn) {
		const type =
			parameter.jsonPath && parameter.jsonPath.isText
				? "string | null"
				: dbColumn;
		return parameter.isArray ? `Array<${type}>` : type;
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
		length
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
		source
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
			...pos
		});

	const pos = (expression: ts.Expression) => ({
		start: expression.getStart(file) - context.node.getStart(file) - 1,
		length: expression.getWidth(file)
	});

	return {
		any,
		own,
		pos
	};
};

export default class SqlTemplateLanguageService
	implements TemplateLanguageService {
	constructor(
		private readonly logger: Logger,
		private readonly config: ParsedPluginConfiguration,
		private readonly typeChecker: TypeChecker
	) {}

	getSemanticDiagnostics(context: TemplateContext): ts.Diagnostic[] {
		const factory = getDiagnosticFactory(context);

		let analysis: Analysis;
		try {
			analysis = analyze(context.text);
		} catch (e) {
			return e instanceof ParseError
				? [factory.own(100_001, e, { start: e.cursorPosition - 1, length: 1 })]
				: [factory.own(100_000, e, { start: 0, length: context.text.length })];
		}

		for (const warning of analysis.warnings) {
			this.logger.log(
				`Warning analyzing template in file ${context.fileName}: ${warning}`
			);
		}

		const schema = this.config.schema;
		if (!schema) {
			return [];
		}

		const expressions = getTemplateExpressions(context.node);
		const diagnostics = Array.from(analysis.parameters.entries())
			.map(([index, parameter]) => ({
				expression: expressions[index - 1],
				parameter
			}))
			.map(({ expression, parameter }) => {
				const parameterType = getParameterType(
					parameter,
					schema,
					this.config.defaultSchemaName
				);
				if (!parameterType) {
					return [factory.own(100_002, parameter, factory.pos(expression))];
				}

				const expressionType = this.typeChecker.getType(expression);
				const content = `{ let expr: ${expressionType}; let param: ${parameterType} = expr; }`;
				return this.typeChecker.check(content).map(diagnostic =>
					unsupportedTypeScriptErrors.has(diagnostic.code)
						? factory.own(100_003, undefined, factory.pos(expression))
						: factory.any({
								code: diagnostic.code,
								messageText: diagnostic.messageText,
								category: diagnostic.category,
								...factory.pos(expression)
						  })
				);
			});

		return flatten(diagnostics);
	}
}
