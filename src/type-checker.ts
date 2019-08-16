import * as ts from "typescript/lib/tsserverlibrary";
import VirtualServiceHost from "./virtual-service-host";

const withoutAliasSymbols = <T>(
	typescript: typeof ts,
	type: ts.Type,
	cb: () => T
): T => {
	const aliasSymbols = new Map<ts.Type, ts.Symbol>();

	// Remove alias symbols from type arguments of reference types.
	// Example: Array<MyUnionType>
	if (type.flags & typescript.TypeFlags.Object) {
		const otype = <ts.ObjectType>type;
		if (otype.objectFlags & typescript.ObjectFlags.Reference) {
			const rtype = <ts.TypeReference>type;
			if (rtype.typeArguments) {
				for (const arg of rtype.typeArguments) {
					if (arg.aliasSymbol) {
						aliasSymbols.set(arg, arg.aliasSymbol);
						arg.aliasSymbol = undefined;
					}
				}
			}
		}
	}

	try {
		return cb();
	} finally {
		for (const [type, aliasSymbol] of aliasSymbols.entries()) {
			type.aliasSymbol = aliasSymbol;
		}
	}
};

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
		return withoutAliasSymbols(this.typescript, type, () =>
			checker.typeToString(
				type,
				undefined,
				this.typescript.TypeFormatFlags.NoTruncation |
					this.typescript.TypeFormatFlags.InTypeAlias
			)
		);
	}

	check(content: string): ts.Diagnostic[] {
		const fileName = `_${Math.floor(Math.random() * 100000)}.ts`;
		return this.virtualServiceHost.withFile(fileName, content, () =>
			this.service.getSemanticDiagnostics(fileName)
		);
	}
}
