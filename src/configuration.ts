import { join as joinPath } from "path";
import * as ts from "typescript/lib/tsserverlibrary";
import { DatabaseSchema, parseSchema } from "./schema";
import { Logger } from "typescript-template-language-service-decorator";

export interface TsSqlTaggedTemplatePluginConfiguration {
	readonly schemaFile?: string;
	readonly defaultSchemaName: string;
}

export const defaults: TsSqlTaggedTemplatePluginConfiguration = {
	defaultSchemaName: "public"
};

export class ExpandedConfiguration {
	schema?: DatabaseSchema;
	defaultSchemaName: string = defaults.defaultSchemaName;

	constructor(
		private readonly project: ts.server.Project,
		private readonly logger: Logger
	) {}

	update(config: TsSqlTaggedTemplatePluginConfiguration) {
		this.logger.log("new config: " + JSON.stringify(config));

		this.schema = undefined;
		if (config.schemaFile) {
			const fullPath = joinPath(
				this.project.getCurrentDirectory(),
				config.schemaFile
			);
			this.logger.log(`reading schema file from: ${fullPath}`);
			const content = this.project.readFile(fullPath);
			if (content) {
				this.schema = parseSchema(content);
			}
		}

		this.defaultSchemaName =
			config.defaultSchemaName || defaults.defaultSchemaName;
	}
}
