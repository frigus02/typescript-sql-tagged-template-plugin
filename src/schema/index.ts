export type ColumnDefinition = string;

export interface TableDefinition {
	[columnName: string]: ColumnDefinition | undefined;
}

export interface SchemaDefinition {
	[tableName: string]: TableDefinition | undefined;
}

export interface DatabaseSchema {
	[schemaName: string]: SchemaDefinition | undefined;
}

const isColumnDefinition = (obj: unknown): obj is ColumnDefinition =>
	typeof obj === "string";

const isTableDefinition = (obj: unknown): obj is TableDefinition =>
	typeof obj === "object" &&
	obj !== null &&
	(Object.keys(obj) as Array<keyof typeof obj>).every((key) =>
		isColumnDefinition(obj[key])
	);

const isSchemaDefinition = (obj: unknown): obj is SchemaDefinition =>
	typeof obj === "object" &&
	obj !== null &&
	(Object.keys(obj) as Array<keyof typeof obj>).every((key) =>
		isTableDefinition(obj[key])
	);

const isDatabaseSchema = (obj: unknown): obj is DatabaseSchema =>
	typeof obj === "object" &&
	obj !== null &&
	(Object.keys(obj) as Array<keyof typeof obj>).every((key) =>
		isSchemaDefinition(obj[key])
	);

export const parseSchema = (json: string): DatabaseSchema => {
	const obj = JSON.parse(json) as unknown;
	if (!isDatabaseSchema(obj)) {
		throw new Error("Schema does not conform to database schema type");
	}

	return obj;
};
