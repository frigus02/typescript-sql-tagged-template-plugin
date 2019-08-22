import { resolve as resolvePath } from "path";
import * as ts from "typescript/lib/tsserverlibrary";
import { DatabaseSchema, parseSchema } from "./schema";
import { Logger } from "typescript-template-language-service-decorator";

export interface PluginConfiguration {
	readonly schemaFile?: string;
	readonly defaultSchemaName?: string;
}

const defaults = {
	defaultSchemaName: "public"
};

export class ParsedPluginConfiguration {
	schema?: DatabaseSchema;
	defaultSchemaName: string = defaults.defaultSchemaName;

	constructor(
		private readonly project: ts.server.Project,
		private readonly logger: Logger
	) {}

	update(config: PluginConfiguration) {
		this.logger.log("new config: " + JSON.stringify(config));

		this.schema = undefined;
		if (config.schemaFile) {
			const fullPath = resolvePath(
				this.project.getCurrentDirectory(),
				config.schemaFile
			);
			this.logger.log(`reading schema file from: ${fullPath}`);
			const content = this.project.readFile(fullPath);
			if (content) {
				try {
					this.schema = parseSchema(content);
				} catch (e) {
					this.logger.log(`error parsing schema file: ${e.message}`);
				}
			}
		}

		this.defaultSchemaName =
			config.defaultSchemaName || defaults.defaultSchemaName;
	}
}
