import {
	decorateWithTemplateLanguageService,
	TemplateSettings,
} from "typescript-template-language-service-decorator";
import * as ts from "typescript/lib/tsserverlibrary";
import { ParsedPluginConfiguration } from "./configuration";
import SqlTemplateLanguageService from "./language-service";
import Logger from "./logger";
import { getSubstitutions } from "./substitutions";
import { TypeChecker } from "./type-checker";
import { TypeResolver } from "./type-resolver";
import VirtualServiceHost from "./virtual-service-host";

const pluginMarker = Symbol("__sqlTaggedTemplatePluginMarker__");

class SqlTaggedTemplatePlugin implements ts.server.PluginModule {
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
			{ strict: true },
			info.project.getCurrentDirectory()
		);
		const typeChecker = new TypeChecker(
			this.typescript,
			virtualServiceHost
		);
		const typeResolver = new TypeResolver(this.typescript, () =>
			info.languageService.getProgram()!.getTypeChecker()
		);

		const sqlTemplateLanguageService = new SqlTemplateLanguageService(
			logger,
			this.config,
			typeChecker,
			typeResolver
		);

		const templateSettings: TemplateSettings = {
			tags: ["sql"],
			enableForStringWithSubstitutions: true,
			getSubstitutions,
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

const factory: ts.server.PluginModuleFactory = (mod) =>
	new SqlTaggedTemplatePlugin(mod.typescript);

export = factory;
