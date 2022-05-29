import * as ts from "typescript/lib/tsserverlibrary";

export default class VirtualServiceHost implements ts.LanguageServiceHost {
	private readonly files = new Map<string, string>();

	constructor(
		private readonly typescript: typeof ts,
		private readonly compilerOptions: ts.CompilerOptions,
		private readonly workspacePath: string
	) {}

	withFile<T>(fileName: string, content: string, callback: () => T): T {
		this.files.set(fileName, content);
		const result = callback();
		this.files.delete(fileName);
		return result;
	}

	getCompilationSettings() {
		return this.compilerOptions;
	}

	getScriptFileNames() {
		return Array.from(this.files.keys());
	}

	getScriptKind() {
		return this.typescript.ScriptKind.TS;
	}

	getScriptVersion() {
		return "0";
	}

	getScriptSnapshot(fileName: string) {
		const fileText = this.readFile(fileName);
		if (fileText) {
			return this.typescript.ScriptSnapshot.fromString(fileText);
		}
	}

	getCurrentDirectory() {
		return this.workspacePath;
	}

	getDefaultLibFileName(options: ts.CompilerOptions) {
		return this.typescript.getDefaultLibFilePath(options);
	}

	fileExists(path: string): boolean {
		return path.includes("node_modules")
			? this.typescript.sys.fileExists(path)
			: this.files.has(path);
	}

	readFile(path: string, encoding?: string | undefined): string | undefined {
		return path.includes("node_modules")
			? this.typescript.sys.readFile(path, encoding)
			: this.files.get(path);
	}

	useCaseSensitiveFileNames() {
		return true;
	}
}
