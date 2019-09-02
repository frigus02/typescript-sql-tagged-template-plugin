import { parse, PgParseError } from "pg-query-emscripten";
import {
	isPgDeleteStmt,
	isPgInsertStmt,
	isPgSelectStmt,
	isPgUpdateStmt,
	isPgRawStmt
} from "./pg-query-emscripten-type-guards";
import {
	getParamMapForDelete,
	getParamMapForInsert,
	getParamMapForSelect,
	getParamMapForUpdate,
	Parameter
} from "./params";
import {
	getReturnValuesForDelete,
	getReturnValuesForInsert,
	getReturnValuesForSelect,
	getReturnValuesForUpdate,
	ReturnValue
} from "./returns";
import { notSupported, Warning } from "./utils";

export interface Analysis {
	warnings: Warning[];
	parameters: Map<number, Parameter>;
	returnValues: ReturnValue[];
}

export class ParseError extends Error {
	public cursorPosition: number;

	constructor(error: PgParseError) {
		super(error.message);
		this.cursorPosition = error.cursorpos;
	}
}

export const analyze = (query: string): Analysis => {
	const warnings: Warning[] = [];
	const result = parse(query);
	if (result.error) {
		throw new ParseError(result.error);
	} else if (result.parse_tree) {
		const stmt = result.parse_tree[0];
		let parameters;
		let returnValues: ReturnValue[];
		if (isPgRawStmt(stmt) && stmt.RawStmt.stmt) {
			const innerStmt = stmt.RawStmt.stmt;
			if (isPgUpdateStmt(innerStmt)) {
				parameters = getParamMapForUpdate(innerStmt, warnings);
				returnValues = getReturnValuesForUpdate(innerStmt, warnings);
			} else if (isPgInsertStmt(innerStmt)) {
				parameters = getParamMapForInsert(innerStmt, warnings);
				returnValues = getReturnValuesForInsert(innerStmt, warnings);
			} else if (isPgSelectStmt(innerStmt)) {
				parameters = getParamMapForSelect(innerStmt, warnings);
				returnValues = getReturnValuesForSelect(innerStmt, warnings);
			} else if (isPgDeleteStmt(innerStmt)) {
				parameters = getParamMapForDelete(innerStmt, warnings);
				returnValues = getReturnValuesForDelete(innerStmt, warnings);
			} else {
				warnings.push(notSupported("statement", innerStmt));
				parameters = new Map<number, Parameter>();
				returnValues = [];
			}
		} else {
			warnings.push(notSupported("statement", stmt));
			parameters = new Map<number, Parameter>();
			returnValues = [];
		}

		return {
			warnings,
			parameters,
			returnValues
		};
	} else {
		throw new Error("Got no result");
	}
};
