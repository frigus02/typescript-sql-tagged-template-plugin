import { resolve as resolvePath } from "path";
import * as ts from "typescript/lib/tsserverlibrary";
import { Logger } from "typescript-template-language-service-decorator";
import { detectPerl } from "./formatting";
import { DatabaseSchema, parseSchema } from "./schema";

export interface PluginConfiguration {
	readonly enableDiagnostics?: boolean;
	readonly enableFormat?: boolean;
	readonly schemaFile?: string;
	readonly defaultSchemaName?: string;
}

const defaults = {
	enableDiagnostics: true,
	enableFormat: true,
	defaultSchemaName: "public",
};

export class ParsedPluginConfiguration {
	enableDiagnostics: boolean = defaults.enableDiagnostics;
	enableFormat: boolean = defaults.enableFormat;
	schema?: DatabaseSchema;
	defaultSchemaName: string = defaults.defaultSchemaName;

	constructor(
		private readonly project: ts.server.Project,
		private readonly logger: Logger
	) {}

	update(config: PluginConfiguration) {
		this.logger.log("new config: " + JSON.stringify(config));

		this.enableDiagnostics =
			config.enableDiagnostics ?? defaults.enableDiagnostics;

		this.enableFormat = config.enableFormat ?? defaults.enableFormat;
		if (this.enableFormat && !detectPerl()) {
			this.logger.log("could not find Perl in PATH; disabling format");
			this.enableFormat = false;
		}

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
