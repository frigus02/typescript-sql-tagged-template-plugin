import { parse, PgParseError } from "pg-query-native";
import {
	isPgDeleteStmt,
	isPgInsertStmt,
	isPgSelectStmt,
	isPgUpdateStmt
} from "./pg-query-native-type-guards";
import {
	getParamMapForDelete,
	getParamMapForInsert,
	getParamMapForSelect,
	getParamMapForUpdate,
	Parameter
} from "./params";
import { notSupported, Warning } from "./utils";

export interface Analysis {
	warnings: Warning[];
	parameters: Map<number, Parameter>;
}

export class ParseError extends Error {
	public cursorPosition: number;

	constructor(error: PgParseError) {
		super(error.message);
		this.cursorPosition = error.cursorPosition;
	}
}

export const analyze = (query: string): Analysis => {
	const warnings: Warning[] = [];
	const result = parse(query);
	if (result.error) {
		throw new ParseError(result.error);
	} else if (result.query) {
		const stmt = result.query[0];
		let parameters;
		if (isPgUpdateStmt(stmt)) {
			parameters = getParamMapForUpdate(stmt, warnings);
		} else if (isPgInsertStmt(stmt)) {
			parameters = getParamMapForInsert(stmt, warnings);
		} else if (isPgSelectStmt(stmt)) {
			parameters = getParamMapForSelect(stmt, warnings);
		} else if (isPgDeleteStmt(stmt)) {
			parameters = getParamMapForDelete(stmt, warnings);
		} else {
			warnings.push(notSupported("statement", stmt));
			parameters = new Map<number, Parameter>();
		}

		return {
			warnings,
			parameters
		};
	} else {
		throw new Error("Got no result");
	}
};
