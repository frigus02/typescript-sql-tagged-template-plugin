import {
	decorateWithTemplateLanguageService,
	TemplateSettings
} from "typescript-template-language-service-decorator";
import * as ts from "typescript/lib/tsserverlibrary";
import { TypeChecker } from "./type-checker";
import SqlTemplateLanguageService from "./language-service";
import { getSubstitutions } from "./substitutions";
import VirtualServiceHost from "./virtual-service-host";
import { ParsedPluginConfiguration } from "./configuration";
import Logger from "./logger";

const pluginMarker = Symbol("__sqlTaggedTemplatePluginMarker__");

class SqlTaggedTemplatePlugin {
	private config?: ParsedPluginConfiguration;

	constructor(private readonly typescript: typeof ts) {}

	create(info: ts.server.PluginCreateInfo): ts.LanguageService {
		if ((info.languageService as any)[pluginMarker]) {
			// Already decorated
			return info.languageService;
		}

		const logger = new Logger(info);

		this.config = new ParsedPluginConfiguration(info.project, logger);
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
