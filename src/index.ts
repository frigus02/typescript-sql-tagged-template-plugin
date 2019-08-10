import {
	decorateWithTemplateLanguageService,
	Logger,
	TemplateSettings
} from "typescript-template-language-service-decorator";
import * as ts from "typescript/lib/tsserverlibrary";
import { pluginName } from "./config";
import { TypeChecker } from "./type-checker";
import SqlTemplateLanguageService from "./language-service";
import { getSubstitutions } from "./substitutions";
import VirtualServiceHost from "./virtual-service-host";

const pluginMarker = Symbol("__sqlTaggedTemplatePluginMarker__");

class LanguageServiceLogger implements Logger {
	constructor(private readonly info: ts.server.PluginCreateInfo) {}

	log(msg: string) {
		this.info.project.projectService.logger.info(`[${pluginName}] ${msg}`);
	}
}

class SqlTaggedTemplatePlugin {
	constructor(private readonly typescript: typeof ts) {}

	create(info: ts.server.PluginCreateInfo): ts.LanguageService {
		if ((info.languageService as any)[pluginMarker]) {
			// Already decorated
			return info.languageService;
		}

		const logger = new LanguageServiceLogger(info);

		const virtualServiceHost = new VirtualServiceHost(
			this.typescript,
			{ ...info.languageServiceHost.getCompilationSettings(), plugins: [] },
			info.project.getCurrentDirectory()
		);
		const diagnostics = new TypeChecker(
			this.typescript,
			virtualServiceHost,
			() => info.languageService.getProgram()!.getTypeChecker()
		);

		const sqlTemplateLanguageService = new SqlTemplateLanguageService(
			logger,
			diagnostics
		);

		const templateSettings: TemplateSettings = {
			tags: ["sql"],
			enableForStringWithSubstitutions: true,
			getSubstitutions
		};

		const languageService = decorateWithTemplateLanguageService(
			this.typescript,
			info.languageService,
			info.project,
			sqlTemplateLanguageService,
			templateSettings,
			{ logger }
		);

		(languageService as any)[pluginMarker] = true;
		return languageService;
	}
}

export = (mod: { typescript: typeof ts }) =>
	new SqlTaggedTemplatePlugin(mod.typescript);
