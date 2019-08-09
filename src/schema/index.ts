import { readFileSync } from "fs";

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

const parseSchema = (json: string): DatabaseSchema => {
	return JSON.parse(json);
};

export const loadSchema = () =>
	parseSchema(readFileSync(`${__dirname}/../../db-schema.json`, "utf8"));
