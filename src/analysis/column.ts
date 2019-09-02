import { PgColumnRef, PgNode } from "pg-query-emscripten";
import { Alias, Relation } from "./relation";
import { Warning, other } from "./utils";
import { isPgString, isPgA_Star } from "./pg-query-emscripten-type-guards";

export interface Column {
	schema?: string;
	table: string;
	column: string;
}

export const getColumn = (
	columnRef: PgColumnRef,
	relations: Map<Alias, Relation>,
	warnings: Warning[]
): Column => {
	if (columnRef.ColumnRef.fields!.length === 0) {
		throw new Error(`ColumnRef has no fields: ${JSON.stringify(columnRef)}`);
	}

	if (columnRef.ColumnRef.fields!.length > 2) {
		warnings.push(other("ColumnRef has more then 2 fields", columnRef));
	}

	const getField = (field: PgNode) => {
		if (isPgString(field)) {
			return field.String.str!;
		} else if (isPgA_Star(field)) {
			return "*";
		} else {
			throw new Error(
				`ColumnRef field not supported: ${JSON.stringify(columnRef)}`
			);
		}
	};

	let relation: Relation;
	let column: string;
	if (columnRef.ColumnRef.fields!.length == 1) {
		relation =
			relations.size === 1
				? Array.from(relations.values())[0]
				: relations.get("") || { table: "<NOT FOUND>" };
		column = getField(columnRef.ColumnRef.fields![0]);
	} else {
		const tableOrAlias = getField(columnRef.ColumnRef.fields![0]);
		relation = relations.get(tableOrAlias) || { table: tableOrAlias };
		column = getField(columnRef.ColumnRef.fields![1]);
	}

	return {
		...relation,
		column
	};
};
