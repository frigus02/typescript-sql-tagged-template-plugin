import { Logger } from "typescript-template-language-service-decorator";
import * as ts from "typescript/lib/tsserverlibrary";

export default class VirtualServiceHost implements ts.LanguageServiceHost {
	private readonly files = new Map<string, string>();

	constructor(
		private readonly typescript: typeof ts,
		private readonly logger: Logger,
		private readonly compilerOptions: ts.CompilerOptions,
		private readonly workspacePath: string
	) {}

	updateFile(fileName: string, content: string) {
		this.logger.log(`updateFile(${fileName}, ${content})`);
		this.files.set(fileName, content);
	}

	getCompilationSettings() {
		return this.compilerOptions;
	}

	getScriptFileNames() {
		this.logger.log(
			`getScriptFileNames() --> ${[...this.files.keys()].join(", ")}`
		);
		return Array.from(this.files.keys());
	}

	getScriptKind() {
		return ts.ScriptKind.TS;
	}

	getScriptVersion() {
		return "0";
	}

	getScriptSnapshot(fileName: string) {
		const file = this.files.get(fileName);
		this.logger.log(`getScriptSnapshot(${fileName}) --> ${file}`);
		if (file) {
			return ts.ScriptSnapshot.fromString(file);
		}
	}

	getCurrentDirectory() {
		this.logger.log(`getCurrentDirectory() --> ${this.workspacePath}`);
		return this.workspacePath;
	}

	getDefaultLibFileName(options: ts.CompilerOptions) {
		return this.typescript.getDefaultLibFilePath(options);
	}

	useCaseSensitiveFileNames() {
		return true;
	}

	readFile(path: string) {
		this.logger.log(`readFile(${path}) --> ${this.files.get(path)}`);
		return this.files.get(path);
	}

	fileExists(path: string) {
		this.logger.log(`fileExists(${path}) --> ${this.files.has(path)}`);
		return this.files.has(path);
	}
}
