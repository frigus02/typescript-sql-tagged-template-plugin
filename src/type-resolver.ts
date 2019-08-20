import * as ts from "typescript/lib/tsserverlibrary";

const getSymbolTableValues = (table: ts.SymbolTable) => {
	const values = [];
	const iter = table.values();
	for (let next = iter.next(); !next.done; next = iter.next()) {
		values.push(next.value);
	}

	return values;
};

const getTypeName = (
	typescript: typeof ts,
	checker: ts.TypeChecker,
	type: ts.Type
) =>
	checker.typeToString(
		type,
		undefined,
		typescript.TypeFormatFlags.InTypeAlias |
			typescript.TypeFormatFlags.NoTruncation
	);

const getTypeArgumentNames = (
	typescript: typeof ts,
	checker: ts.TypeChecker,
	type: ts.Type
) => {
	if (type.flags & typescript.TypeFlags.Object) {
		const otype = <ts.ObjectType>type;
		if (otype.objectFlags & typescript.ObjectFlags.Reference) {
			const rtype = <ts.TypeReference>type;
			if (rtype.typeArguments) {
				return rtype.typeArguments.map(arg =>
					getTypeName(typescript, checker, arg)
				);
			}
		}
	}

	return [];
};

const getNodeTypeName = (
	typescript: typeof ts,
	checker: ts.TypeChecker,
	node: ts.Node
): string => {
	const type = checker.getTypeAtLocation(node);
	if (type.symbol && type.symbol.flags & typescript.SymbolFlags.Interface) {
		const typeArgumentNames = getTypeArgumentNames(typescript, checker, type);
		if (type.symbol.escapedName === "Array") {
			return `Array<${typeArgumentNames.join(", ")}>`;
		} else {
			let name = "{ ";
			if (type.symbol.members) {
				const members = getSymbolTableValues(type.symbol.members);
				const typeParamTypes: { [key: string]: string | undefined } = members
					.filter(member => member.flags & typescript.SymbolFlags.TypeParameter)
					.map((member, i) => [
						member.escapedName as string,
						typeArgumentNames[i]
					])
					.reduce((acc, [name, type]) => ({ ...acc, [name]: type }), {});

				for (const member of members.filter(
					member => member.flags & typescript.SymbolFlags.Property
				)) {
					let memberType = getNodeTypeName(
						typescript,
						checker,
						member.valueDeclaration
					);
					if (typeParamTypes[memberType]) {
						memberType = typeParamTypes[memberType]!;
					}

					name += `${member.escapedName}: ${memberType}; `;
				}
			}
			name += "}";
			return name;
		}
	} else {
		return getTypeName(typescript, checker, type);
	}
};

export class TypeResolver {
	constructor(
		private readonly typescript: typeof ts,
		private readonly getTypeChecker: () => ts.TypeChecker
	) {}

	getType(node: ts.Node): string {
		const checker = this.getTypeChecker();
		return getNodeTypeName(this.typescript, checker, node);
	}
}
