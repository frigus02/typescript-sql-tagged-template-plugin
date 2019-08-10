import { Logger } from "typescript-template-language-service-decorator";
import * as ts from "typescript/lib/tsserverlibrary";
import VirtualServiceHost from "./virtual-service-host";

export class TypeScriptDiagnostics {
	private readonly registry: ts.DocumentRegistry;
	private readonly service: ts.LanguageService;

	constructor(
		private readonly typescript: typeof ts,
		private readonly logger: Logger,
		private readonly virtualServiceHost: VirtualServiceHost,
		private readonly getProgram: () => ts.Program
	) {
		this.registry = this.typescript.createDocumentRegistry(true);
		this.service = this.typescript.createLanguageService(
			virtualServiceHost,
			this.registry,
			false
		);
	}

	getType(node: ts.Node): string {
		this.logger.log(`getType()`);
		try {
			const program = this.getProgram();
			const checker = program.getTypeChecker();
			return checker.typeToString(checker.getTypeAtLocation(node));
		} catch (e) {
			this.logger.log(`getType() error: ${e.message}`);
			return "any";
		}
	}

	diagnoseFile(content: string): ts.Diagnostic[] {
		this.logger.log(`diagnoseFile(${content})`);
		const fileName = `_${Math.floor(Math.random() * 100000)}.ts`;
		this.virtualServiceHost.updateFile(fileName, content);
		this.logger.log(`diagnoseFile() getSemanticDiagnostics(${fileName})`);
		const diagnostics = this.service.getSemanticDiagnostics(fileName);
		this.logger.log(`diagnoseFile() releaseDocument(...)`);
		this.registry.releaseDocument(
			fileName,
			this.virtualServiceHost.getCompilationSettings()
		);
		return diagnostics;
	}
}
