import { Logger } from "typescript-template-language-service-decorator";
import * as ts from "typescript/lib/tsserverlibrary";
import { pluginName } from "./config";

export default class implements Logger {
	constructor(private readonly info: ts.server.PluginCreateInfo) {}

	log(msg: string) {
		this.info.project.projectService.logger.info(`[${pluginName}] ${msg}`);
	}
}
