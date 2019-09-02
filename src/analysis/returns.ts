import {
	PgDeleteStmt,
	PgInsertStmt,
	PgSelectStmt,
	PgUpdateStmt,
	PgA_Const,
	PgColumnRef,
	PgNode
} from "pg-query-emscripten";
import {
	isPgResTarget,
	isPgA_Const,
	isPgInteger,
	isPgString,
	isPgColumnRef,
	isPgFloat,
	isPgBitString
} from "./pg-query-emscripten-type-guards";
import {
	Alias,
	Relation,
	getRelationsForSelect,
	getRelationsForDelete,
	getRelationsForInsert,
	getRelationsForUpdate
} from "./relation";
import { Warning } from "./utils";
import { getColumn } from "./column";

export type ReturnValue =
	| ConstReturnValue
	| ColumnReturnValue
	| StarReturnValue
	| UnknownReturnValue;

// https://www.postgresql.org/docs/10/sql-syntax-lexical.html#SQL-SYNTAX-CONSTANTS
export type ConstReturnValue =
	| ConstIntegerReturnValue
	| ConstFloatReturnValue
	| ConstStringReturnValue
	| ConstBitStringReturnValue
	| ConstUnknownReturnValue;

export interface ConstIntegerReturnValue {
	type: "const";
	constType: "integer";
	alias?: string;
	value: number;
}

export interface ConstFloatReturnValue {
	type: "const";
	constType: "float";
	alias?: string;
	value: string;
}

export interface ConstStringReturnValue {
	type: "const";
	constType: "string";
	alias?: string;
	value: string;
}

export interface ConstBitStringReturnValue {
	type: "const";
	constType: "bitstring";
	alias?: string;
	value: string;
}

export interface ConstUnknownReturnValue {
	type: "const";
	constType: "unknown";
	alias?: string;
}

export interface ColumnReturnValue {
	type: "column";
	alias?: string;
	schema?: string;
	table: string;
	column: string;
}

export interface StarReturnValue {
	type: "star";
	alias?: string;
	schema?: string;
	table: string;
}

export interface UnknownReturnValue {
	type: "unknown";
}

const getConstReturnValue = (
	alias: string | undefined,
	node: PgA_Const
): ConstReturnValue => {
	if (isPgInteger(node.A_Const.val)) {
		return {
			type: "const",
			constType: "integer",
			alias,
			value: node.A_Const.val.Integer.ival
		};
	} else if (isPgFloat(node.A_Const.val)) {
		return {
			type: "const",
			constType: "float",
			alias,
			value: node.A_Const.val.Float.str!
		};
	} else if (isPgString(node.A_Const.val)) {
		return {
			type: "const",
			constType: "string",
			alias,
			value: node.A_Const.val.String.str!
		};
	} else if (isPgBitString(node.A_Const.val)) {
		return {
			type: "const",
			constType: "bitstring",
			alias,
			value: node.A_Const.val.BitString.str!
		};
	} else {
		return {
			type: "const",
			constType: "unknown",
			alias
		};
	}
};

const getColumnReturnValue = (
	alias: string | undefined,
	columnRef: PgColumnRef,
	relations: Map<Alias, Relation>,
	warnings: Warning[]
): ColumnReturnValue | StarReturnValue => {
	const column = getColumn(columnRef, relations, warnings);
	if (column.column === "*") {
		return {
			type: "star",
			alias,
			schema: column.schema,
			table: column.table
		};
	} else {
		return {
			type: "column",
			alias,
			schema: column.schema,
			table: column.table,
			column: column.column
		};
	}
};

const getReturnValuesFromTargetOrReturningList = (
	list: PgNode[],
	relations: Map<Alias, Relation>,
	warnings: Warning[]
): ReturnValue[] =>
	list.map(item => {
		if (isPgResTarget(item)) {
			const { name, val } = item.ResTarget;
			if (val && isPgA_Const(val)) {
				return getConstReturnValue(name, val);
			} else if (val && isPgColumnRef(val)) {
				return getColumnReturnValue(name, val, relations, warnings);
			} else {
				return { type: "unknown" };
			}
		} else {
			return { type: "unknown" };
		}
	});

export const getReturnValuesForUpdate = (
	stmt: PgUpdateStmt,
	warnings: Warning[]
) => {
	const relations = getRelationsForUpdate(stmt);
	if (stmt.UpdateStmt.returningList) {
		return getReturnValuesFromTargetOrReturningList(
			stmt.UpdateStmt.returningList,
			relations,
			warnings
		);
	}

	return [];
};

export const getReturnValuesForInsert = (
	stmt: PgInsertStmt,
	warnings: Warning[]
) => {
	const relations = getRelationsForInsert(stmt);
	if (stmt.InsertStmt.returningList) {
		return getReturnValuesFromTargetOrReturningList(
			stmt.InsertStmt.returningList,
			relations,
			warnings
		);
	}

	return [];
};

export const getReturnValuesForSelect = (
	stmt: PgSelectStmt,
	warnings: Warning[]
): ReturnValue[] => {
	const relations = getRelationsForSelect(stmt);
	if (stmt.SelectStmt.targetList) {
		return getReturnValuesFromTargetOrReturningList(
			stmt.SelectStmt.targetList,
			relations,
			warnings
		);
	}

	return [];
};

export const getReturnValuesForDelete = (
	stmt: PgDeleteStmt,
	warnings: Warning[]
) => {
	const relations = getRelationsForDelete(stmt);
	if (stmt.DeleteStmt.returningList) {
		return getReturnValuesFromTargetOrReturningList(
			stmt.DeleteStmt.returningList,
			relations,
			warnings
		);
	}

	return [];
};
