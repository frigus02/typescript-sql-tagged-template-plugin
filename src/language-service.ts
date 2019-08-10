import {
	Logger,
	TemplateContext,
	TemplateLanguageService
} from "typescript-template-language-service-decorator";
import * as ts from "typescript/lib/tsserverlibrary";
import { pluginName } from "./config";
import { DatabaseSchema, loadSchema, ColumnDefinition } from "./schema";
import { Analysis, analyze, ParseError } from "./analysis";
import { TypeScriptDiagnostics } from "./diagnostics";
import { Parameter } from "./analysis/params";

const getExpressions = (node: ts.TemplateLiteral) => {
	if (ts.isTemplateExpression(node)) {
		return node.templateSpans.map(span => span.expression);
	} else {
		return [];
	}
};

const stringifyParameter = (parameter: Parameter): string => {
	return [
		parameter.schema,
		parameter.table,
		parameter.column,
		parameter.jsonPath && parameter.jsonPath.path
	]
		.filter(x => x)
		.join(".");
};

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
		return parameter.jsonPath && parameter.jsonPath.isText
			? "string | null"
			: dbColumn;
	}
};

export default class SqlTemplateLanguageService
	implements TemplateLanguageService {
	private readonly schema: DatabaseSchema;

	constructor(
		private readonly typescript: typeof ts,
		private readonly logger: Logger,
		private readonly diagnostics: TypeScriptDiagnostics
	) {
		this.schema = loadSchema();
	}

	getSemanticDiagnostics(context: TemplateContext): ts.Diagnostic[] {
		this.logger.log(`getSemanticDiagnostics()`);

		try {
			const sourceFile = context.node.getSourceFile();
			const create = ({
				code,
				messageText,
				category,
				start,
				length
			}: Pick<
				ts.Diagnostic,
				"code" | "messageText" | "category" | "start" | "length"
			>) => ({
				code,
				messageText,
				category,
				file: sourceFile,
				start,
				length,
				source: pluginName
			});
			const createError = ({
				code,
				messageText,
				start,
				length
			}: Pick<ts.Diagnostic, "code" | "messageText" | "start" | "length">) =>
				create({
					code,
					messageText,
					category: context.typescript.DiagnosticCategory.Error,
					start,
					length
				});
			const createErrorAtExpression = (
				expression: ts.Expression,
				{ code, messageText }: Pick<ts.Diagnostic, "code" | "messageText">
			) =>
				createError({
					code,
					messageText,
					start:
						expression.getStart(sourceFile) - context.node.getStart(sourceFile),
					length: expression.getWidth(sourceFile)
				});

			let analysis: Analysis;
			try {
				analysis = analyze(context.text);
			} catch (e) {
				if (e instanceof ParseError) {
					return [
						createError({
							code: 1001,
							messageText: `Failed to parse: ${e.message}`,
							start: e.cursorPosition - 1,
							length: 1
						})
					];
				} else {
					return [
						createError({
							code: 1002,
							messageText: `Failed to parse: ${e.message}`,
							start: 0,
							length: context.text.length
						})
					];
				}
			}

			for (const warning of analysis.warnings) {
				this.logger.log(`analysis warning: ${warning}`);
			}

			const expressions = getExpressions(context.node);
			const items: ts.Diagnostic[] = [];
			for (const [index, parameter] of analysis.parameters.entries()) {
				const expression = expressions[index - 1];
				const parameterType = getParameterType(
					parameter,
					this.schema,
					"public"
				);
				if (!parameterType) {
					items.push(
						createErrorAtExpression(expression, {
							code: 1003,
							messageText: `Cannot find type for parameter ${stringifyParameter(
								parameter
							)} in schema`
						})
					);
					continue;
				}

				const expressionType = this.diagnostics.getType(expression);

				const content = `let parameter: ${parameterType}; let expression: ${expressionType} = parameter;`;
				try {
					const newItems = this.diagnostics.diagnoseFile(content);
					for (const item of newItems) {
						items.push(
							createErrorAtExpression(expression, {
								code: 1004,
								messageText: item.messageText
							})
						);
					}
				} catch (e) {
					this.logger.log(
						`Error getting diagnostics for ${stringifyParameter(parameter)}: ${
							e.message
						}`
					);
				}
			}

			return items;
		} catch (e) {
			this.logger.log(`getSemanticDiagnostics() error: ${e.message}`);
			return [];
		}
	}
}
