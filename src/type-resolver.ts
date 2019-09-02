import * as ts from "typescript/lib/tsserverlibrary";

const BUILT_IN_TYPES = new Set([
	"ArrayBuffer",
	"Buffer",
	"BigInt",
	"Boolean",
	"Date",
	"Number",
	"Object",
	"String"
]);

const isBuiltInType = (simpleTypeName: string) =>
	BUILT_IN_TYPES.has(simpleTypeName);

const getSymbolTableValues = (table: ts.SymbolTable) => {
	const values = [];
	const iter = table.values();
	for (let next = iter.next(); !next.done; next = iter.next()) {
		values.push(next.value);
	}

	return values;
};

const getSimpleTypeName = (
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

const getUnionOrIntersectionTypeName = (
	typescript: typeof ts,
	checker: ts.TypeChecker,
	type: ts.UnionOrIntersectionType,
	seenTypes: Set<ts.Type>,
	resolvedTypes: Map<ts.Type, string>
) =>
	type.types
		.map(type =>
			getTypeName(typescript, checker, type, seenTypes, resolvedTypes)
		)
		.join(type.isUnion() ? " | " : " & ");

const getTypeArgumentNames = (
	typescript: typeof ts,
	checker: ts.TypeChecker,
	type: ts.Type,
	seenTypes: Set<ts.Type>,
	resolvedTypes: Map<ts.Type, string>
) => {
	if (type.flags & typescript.TypeFlags.Object) {
		const otype = <ts.ObjectType>type;
		if (otype.objectFlags & typescript.ObjectFlags.Reference) {
			const rtype = <ts.TypeReference>type;
			if (rtype.typeArguments) {
				return rtype.typeArguments.map(arg =>
					getTypeName(typescript, checker, arg, seenTypes, resolvedTypes)
				);
			}
		}
	}

	return [];
};

const getTypeName = (
	typescript: typeof ts,
	checker: ts.TypeChecker,
	type: ts.Type,
	seenTypes: Set<ts.Type>,
	resolvedTypes: Map<ts.Type, string>
): string => {
	let resolvedType = resolvedTypes.get(type);
	if (resolvedType) {
		return resolvedType;
	}

	if (seenTypes.has(type)) {
		return "CIRCULAR_REFERENCE";
	}

	seenTypes.add(type);

	const simpleTypeName = getSimpleTypeName(typescript, checker, type);
	if (isBuiltInType(simpleTypeName)) {
		resolvedType = simpleTypeName;
	} else if (
		type.symbol &&
		type.symbol.flags & typescript.SymbolFlags.Interface &&
		type.symbol.escapedName === "Array"
	) {
		const typeArgumentNames = getTypeArgumentNames(
			typescript,
			checker,
			type,
			seenTypes,
			resolvedTypes
		);
		resolvedType = `Array<${typeArgumentNames.join(", ")}>`;
	} else if (
		type.symbol &&
		(type.symbol.flags & typescript.SymbolFlags.Interface ||
			type.symbol.flags & typescript.SymbolFlags.TypeLiteral)
	) {
		const typeArgumentNames = getTypeArgumentNames(
			typescript,
			checker,
			type,
			seenTypes,
			resolvedTypes
		);
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
					member.valueDeclaration,
					seenTypes,
					resolvedTypes
				);
				if (typeParamTypes[memberType]) {
					memberType = typeParamTypes[memberType]!;
				}

				name += `${member.escapedName}: ${memberType}; `;
			}
		}
		name += "}";
		resolvedType = name;
	} else if (type.isUnionOrIntersection()) {
		resolvedType = getUnionOrIntersectionTypeName(
			typescript,
			checker,
			type,
			seenTypes,
			resolvedTypes
		);
	} else {
		resolvedType = simpleTypeName;
	}

	resolvedTypes.set(type, resolvedType);
	return resolvedType;
};

const getNodeTypeName = (
	typescript: typeof ts,
	checker: ts.TypeChecker,
	node: ts.Node,
	seenTypes: Set<ts.Type>,
	resolvedTypes: Map<ts.Type, string>
): string => {
	const type = checker.getTypeAtLocation(node);
	return getTypeName(typescript, checker, type, seenTypes, resolvedTypes);
};

export class TypeResolver {
	constructor(
		private readonly typescript: typeof ts,
		private readonly getTypeChecker: () => ts.TypeChecker
	) {}

	getType(node: ts.Node): string {
		const checker = this.getTypeChecker();
		return getNodeTypeName(
			this.typescript,
			checker,
			node,
			new Set(),
			new Map()
		);
	}

	getTypeOfFirstTypeArgument(node: ts.Node): string | undefined {
		const checker = this.getTypeChecker();
		const type = checker.getTypeAtLocation(node);
		const typeArgumentNames = getTypeArgumentNames(
			this.typescript,
			checker,
			type,
			new Set(),
			new Map()
		);
		if (typeArgumentNames.length === 1) {
			return typeArgumentNames[0];
		}
	}
}
