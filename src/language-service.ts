import {
	Logger,
	TemplateContext,
	TemplateLanguageService
} from "typescript-template-language-service-decorator";
import * as ts from "typescript/lib/tsserverlibrary";
import { pluginName } from "./config";

export default class SqlTemplateLanguageService
	implements TemplateLanguageService {
	constructor(
		private readonly typescript: typeof ts,
		private readonly logger: Logger
	) {}

	getSemanticDiagnostics(context: TemplateContext): ts.Diagnostic[] {
		return [
			{
				code: 1337,
				messageText: "My first message",
				category: context.typescript.DiagnosticCategory.Message,
				file: context.node.getSourceFile(),
				start: 10,
				length: 5,
				source: pluginName
			}
		];
	}
}
