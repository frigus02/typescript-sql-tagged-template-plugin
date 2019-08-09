import {
	Logger,
	TemplateContext,
	TemplateLanguageService
} from "typescript-template-language-service-decorator";
import * as ts from "typescript/lib/tsserverlibrary";
import { pluginName } from "./config";
import { DatabaseSchema, loadSchema } from "./schema";
import { Analysis, analyze, ParseError } from "./analysis";

export default class SqlTemplateLanguageService
	implements TemplateLanguageService {
	private readonly schema: DatabaseSchema;

	constructor(
		private readonly typescript: typeof ts,
		private readonly logger: Logger
	) {
		this.schema = loadSchema();
	}

	getSemanticDiagnostics(context: TemplateContext): ts.Diagnostic[] {
		const sourceFile = context.node.getSourceFile();
		const createError = ({
			code,
			messageText,
			start,
			length
		}: Pick<ts.Diagnostic, "code" | "messageText" | "start" | "length">) => ({
			code,
			messageText,
			category: context.typescript.DiagnosticCategory.Error,
			file: sourceFile,
			start,
			length,
			source: pluginName
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

		return [
			{
				code: 1337,
				messageText: "My first message",
				category: context.typescript.DiagnosticCategory.Message,
				file: sourceFile,
				start: 10,
				length: 5,
				source: pluginName
			}
		];
	}
}
