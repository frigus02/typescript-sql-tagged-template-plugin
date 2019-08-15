import * as ts from "typescript/lib/tsserverlibrary";
import VirtualServiceHost from "./virtual-service-host";

export class TypeChecker {
	private readonly registry: ts.DocumentRegistry;
	private readonly service: ts.LanguageService;

	constructor(
		private readonly typescript: typeof ts,
		private readonly virtualServiceHost: VirtualServiceHost,
		private readonly getTypeChecker: () => ts.TypeChecker
	) {
		this.registry = this.typescript.createDocumentRegistry(true);
		this.service = this.typescript.createLanguageService(
			virtualServiceHost,
			this.registry,
			false
		);
	}

	getType(node: ts.Node): string {
		const checker = this.getTypeChecker();
		const type = checker.getTypeAtLocation(node);
		return checker.typeToString(
			type,
			undefined,
			this.typescript.TypeFormatFlags.NoTruncation
		);
	}

	check(content: string): ts.Diagnostic[] {
		const fileName = `_${Math.floor(Math.random() * 100000)}.ts`;
		return this.virtualServiceHost.withFile(fileName, content, () =>
			this.service.getSemanticDiagnostics(fileName)
		);
	}
}
