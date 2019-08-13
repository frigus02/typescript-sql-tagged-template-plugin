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
		return parameter.jsonPath && parameter.jsonPath.isText
			? "string | null"
			: dbColumn;
	}
};

const getDiagnosticFactory = (context: TemplateContext) => {
	const file = context.node.getSourceFile();
	const source = pluginName;

	const error = ({
		code,
		messageText,
		start,
		length
	}: Pick<
		ts.Diagnostic,
		"code" | "messageText" | "start" | "length"
	>): ts.Diagnostic => ({
		code,
		messageText,
		category: context.typescript.DiagnosticCategory.Error,
		file,
		start,
		length,
		source
	});

	const errorAtExpression = (
		expression: ts.Expression,
		{ code, messageText }: Pick<ts.Diagnostic, "code" | "messageText">
	): ts.Diagnostic =>
		error({
			code,
			messageText,
			start: expression.getStart(file) - context.node.getStart(file) - 1,
			length: expression.getWidth(file)
		});

	return {
		error,
		errorAtExpression
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
			if (e instanceof ParseError) {
				return [
					factory.error({
						code: 1001,
						messageText: `Failed to parse: ${e.message}`,
						start: e.cursorPosition - 1,
						length: 1
					})
				];
			} else {
				return [
					factory.error({
						code: 1002,
						messageText: `Failed to parse: ${e.message}`,
						start: 0,
						length: context.text.length
					})
				];
			}
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
					return [
						factory.errorAtExpression(expression, {
							code: 1003,
							messageText: `Cannot find type for parameter ${stringifyParameter(
								parameter
							)} in schema`
						})
					];
				}

				const expressionType = this.typeChecker.getType(expression);
				const content = `{ let expr: ${expressionType}; let param: ${parameterType} = expr; }`;
				return this.typeChecker.check(content).map(diagnostic =>
					factory.errorAtExpression(expression, {
						code: 1004,
						messageText: diagnostic.messageText
					})
				);
			});

		return flatten(diagnostics);
	}
}
