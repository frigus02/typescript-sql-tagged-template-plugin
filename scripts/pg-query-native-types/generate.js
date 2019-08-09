const fs = require("fs");
const { promisify } = require("util");
const outdent = require("outdent");
const indentString = require("indent-string");
const mkdir = promisify(fs.mkdir);
const writeFile = promisify(fs.writeFile);

const typeMap = require("./types.json");
const enumDefs = require("./enum_defs.json");
const enumDefsKeys = [
	"nodes/lockoptions",
	"nodes/nodes",
	"nodes/primnodes",
	"nodes/parsenodes"
];
const structDefs = require("./struct_defs.json");
const structDefsKeys = ["nodes/value", "nodes/primnodes", "nodes/parsenodes"];

const getOptional = c_type => {
	if (c_type.endsWith("*")) {
		return "?";
	} else {
		return "";
	}
};

const getType = (name, c_type) => {
	if (name === "valuesLists") {
		return "PgNode[][]";
	} else {
		return typeMap[c_type] || `Pg${c_type}`;
	}
};

const generateFields = fields =>
	fields
		.filter(field => field.name && field.name !== "type")
		.map(
			({ name, c_type, comment }) => outdent`
        ${comment || "/**/"}
        ${name}${getOptional(c_type)}: ${getType(name, c_type)};
      `
		)
		.join("\n");

const generateEnums = types =>
	Object.keys(types)
		.map(type => {
			const { values, comment } = types[type];
			const enumValues = values
				.filter(v => v.name)
				.map((v, i) => `${v.name} = ${i}`)
				.join(",\n");
			return outdent`
        ${comment || "/**/\n"}const enum Pg${type} {
      ${indentString(enumValues, 4)}
        }
      `;
		})
		.join("\n");

const generateInterfaces = types =>
	Object.keys(types)
		.map(type => {
			const { fields, comment } = types[type];
			return outdent`
        ${comment || "/**/\n"}interface Pg${type} extends PgNode {
          ${type}: {
        ${indentString(generateFields(fields), 4)}
          }
        }
      `;
		})
		.join("\n");

const generateTypings = async () => {
	const enums = enumDefsKeys
		.map(key => enumDefs[key])
		.map(types => generateEnums(types))
		.join("\n");
	const interfaces = structDefsKeys
		.map(key => structDefs[key])
		.map(types => generateInterfaces(types))
		.join("\n");

	const result = outdent`
    declare module "pg-query-native" {
      interface PgNode {}

    ${indentString(enums, 2)}

    ${indentString(interfaces, 2)}

      interface PgParseError extends Error {
        fileName: string;
        lineNumber: number;
        cursorPosition: number;
        functionName: string;
        context: string;
      }

      interface PgParseResult {
        query?: PgNode[];
        error?: PgParseError;
      }

      function parse(query: string): PgParseResult;
    }
  `;

	const dir = `${__dirname}/../../typings/pg-query-native`;
	await mkdir(dir, { recursive: true });
	await writeFile(`${dir}/index.d.ts`, result, "utf8");
};

const generateTypeGuards = async () => {
	const types = structDefsKeys
		.map(key => structDefs[key])
		.flatMap(types => Object.keys(types));
	const imports = types.map(type => `Pg${type}`).join(", ");
	const typeGuards = types
		.map(
			type =>
				`export const isPg${type} = (obj: PgNode): obj is Pg${type} => !!(<any>obj).${type};`
		)
		.join("\n");
	const result = outdent`
    import { PgNode, ${imports} } from "pg-query-native";
    export const isPgNodeArray = (obj: PgNode): obj is PgNode[] => Array.isArray(obj);
    ${typeGuards}
  `;

	const dir = `${__dirname}/../../src/analysis`;
	await mkdir(dir, { recursive: true });
	await writeFile(`${dir}/pg-query-native-type-guards.ts`, result, "utf8");
};

async function main() {
	await generateTypings();
	await generateTypeGuards();
}

main().catch(console.error);
