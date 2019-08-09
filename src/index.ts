import {
	decorateWithTemplateLanguageService,
	Logger,
	TemplateSettings
} from "typescript-template-language-service-decorator";
import * as ts from "typescript/lib/tsserverlibrary";
import { pluginName } from "./config";
import SqlTemplateLanguageService from "./language-service";
import { getSubstitutions } from "./substitutions";

const pluginMarker = Symbol("__sqlTaggedTemplatePluginMarker__");

class LanguageServiceLogger implements Logger {
	constructor(private readonly info: ts.server.PluginCreateInfo) {}

	log(msg: string) {
		this.info.project.projectService.logger.info(`[${pluginName}] ${msg}`);
	}
}

class SqlTaggedTemplatePlugin {
	constructor(private readonly _typescript: typeof ts) {}

	create(info: ts.server.PluginCreateInfo): ts.LanguageService {
		if ((info.languageService as any)[pluginMarker]) {
			// Already decorated
			return info.languageService;
		}

		const logger = new LanguageServiceLogger(info);

		const sqlTemplateLanguageService = new SqlTemplateLanguageService(
			this._typescript,
			logger
		);

		const templateSettings: TemplateSettings = {
			tags: ["sql"],
			enableForStringWithSubstitutions: true,
			getSubstitutions
		};

		const languageService = decorateWithTemplateLanguageService(
			this._typescript,
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
