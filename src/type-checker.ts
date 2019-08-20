import * as ts from "typescript/lib/tsserverlibrary";
import VirtualServiceHost from "./virtual-service-host";

export class TypeChecker {
	private readonly registry: ts.DocumentRegistry;
	private readonly service: ts.LanguageService;

	constructor(
		private readonly typescript: typeof ts,
		private readonly virtualServiceHost: VirtualServiceHost
	) {
		this.registry = this.typescript.createDocumentRegistry(true);
		this.service = this.typescript.createLanguageService(
			virtualServiceHost,
			this.registry,
			false
		);
	}

	check(content: string): ts.Diagnostic[] {
		const fileName = `_${Math.floor(Math.random() * 100000)}.ts`;
		return this.virtualServiceHost.withFile(fileName, content, () =>
			this.service.getSemanticDiagnostics(fileName)
		);
	}
}
