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
import { ExpandedConfiguration } from "./configuration";

const pluginMarker = Symbol("__sqlTaggedTemplatePluginMarker__");

class LanguageServiceLogger implements Logger {
	constructor(private readonly info: ts.server.PluginCreateInfo) {}

	log(msg: string) {
		this.info.project.projectService.logger.info(`[${pluginName}] ${msg}`);
	}
}

class SqlTaggedTemplatePlugin {
	private config?: ExpandedConfiguration;

	constructor(private readonly typescript: typeof ts) {}

	create(info: ts.server.PluginCreateInfo): ts.LanguageService {
		if ((info.languageService as any)[pluginMarker]) {
			// Already decorated
			return info.languageService;
		}

		const logger = new LanguageServiceLogger(info);

		this.config = new ExpandedConfiguration(info.project, logger);
		this.onConfigurationChanged(info.config);

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
			this.config,
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

	public onConfigurationChanged(config: any) {
		this.config!.update(config);
	}
}

export = (mod: { typescript: typeof ts }) =>
	new SqlTaggedTemplatePlugin(mod.typescript);
