import {
	PgA_Expr_Kind,
	PgColumnRef,
	PgDeleteStmt,
	PgInsertStmt,
	PgNode,
	PgSelectStmt,
	PgUpdateStmt,
	PgA_Expr
} from "pg-query-emscripten";
import {
	isPgA_Const,
	isPgA_Expr,
	isPgBoolExpr,
	isPgColumnRef,
	isPgNodeArray,
	isPgNullTest,
	isPgParamRef,
	isPgResTarget,
	isPgSelectStmt,
	isPgString,
	isPgSubLink,
	isPgInteger
} from "./pg-query-emscripten-type-guards";
import {
	Alias,
	Relation,
	getRelation,
	getRelationsForDelete,
	getRelationsForSelect,
	getRelationsForUpdate
} from "./relation";
import { assignMap, notSupported, other, Warning } from "./utils";
import { getColumn } from "./column";

export interface Parameter {
	schema?: string;
	table: string;
	column: string;
	isArray: boolean;
	jsonPath?: {
		path: string | number;
		isText: boolean;
	};
}

const COMPARISON_OPERATORS = ["<", ">", "<=", ">=", "=", "<>"];
const JSON_OPERATORS = ["->", "->>", "#>", "#>>"];
const JSON_OPERATORS_RETURNING_TEXT = ["->>", "#>>"];

const getParameter = (
	columnRef: PgColumnRef,
	relations: Map<Alias, Relation>,
	warnings: Warning[]
): Parameter => {
	const column = getColumn(columnRef, relations, warnings);
	if (column.column === "*") {
		throw new Error(
			`ColumnRef with "*" is not supported: ${JSON.stringify(columnRef)}`
		);
	}

	return {
		...column,
		isArray: false
	};
};

const getOperator = (expr: PgA_Expr) => {
	const name = expr.A_Expr.name;
	if (name && isPgNodeArray(name)) {
		const first = name[0];
		if (first && isPgString(first)) {
			return first.String.str;
		}
	}
};

const getParamMapForWhereClause = (
	whereClause: PgNode,
	relations: Map<Alias, Relation>,
	warnings: Warning[]
) => {
	const params = new Map<number, Parameter>();
	if (isPgA_Expr(whereClause)) {
		const expr = whereClause.A_Expr;
		switch (expr.kind) {
			case PgA_Expr_Kind.AEXPR_IN:
				if (isPgNodeArray(expr.rexpr!)) {
					if (isPgColumnRef(expr.lexpr!)) {
						const column = getParameter(expr.lexpr, relations, warnings);
						for (const field of expr.rexpr) {
							if (isPgParamRef(field)) {
								params.set(field.ParamRef.number, column);
							}
						}
					} else {
						warnings.push(notSupported("where clause", whereClause));
					}
				} else {
					warnings.push(notSupported("where clause", whereClause));
				}
				break;
			case PgA_Expr_Kind.AEXPR_OP:
			case PgA_Expr_Kind.AEXPR_OP_ANY:
			case PgA_Expr_Kind.AEXPR_OP_ALL:
				const operator = getOperator(whereClause);
				if (!operator || !COMPARISON_OPERATORS.includes(operator)) {
					warnings.push(notSupported("where clause", whereClause));
				} else if (isPgParamRef(expr.rexpr!)) {
					const isArray = [
						PgA_Expr_Kind.AEXPR_OP_ANY,
						PgA_Expr_Kind.AEXPR_OP_ALL
					].includes(expr.kind);
					if (isPgColumnRef(expr.lexpr!)) {
						params.set(expr.rexpr.ParamRef.number, {
							...getParameter(expr.lexpr, relations, warnings),
							isArray
						});
					} else if (
						isPgA_Expr(expr.lexpr!) &&
						JSON_OPERATORS.includes(getOperator(expr.lexpr) || "") &&
						isPgColumnRef(expr.lexpr.A_Expr.lexpr!) &&
						isPgA_Const(expr.lexpr.A_Expr.rexpr!)
					) {
						const operator = getOperator(expr.lexpr)!;
						const pathVal = expr.lexpr.A_Expr.rexpr.A_Const.val;
						params.set(expr.rexpr.ParamRef.number, {
							...getParameter(expr.lexpr.A_Expr.lexpr, relations, warnings),
							jsonPath: {
								path: isPgInteger(pathVal)
									? pathVal.Integer.ival
									: isPgString(pathVal)
									? pathVal.String.str!
									: "<UNKNOWN>",
								isText: JSON_OPERATORS_RETURNING_TEXT.includes(operator)
							},
							isArray
						});
					} else {
						warnings.push(notSupported("where clause", whereClause));
					}
				} else if (
					isPgSubLink(expr.rexpr!) &&
					expr.rexpr.SubLink.subselect &&
					isPgSelectStmt(expr.rexpr.SubLink.subselect)
				) {
					assignMap(
						params,
						getParamMapForSelect(
							expr.rexpr.SubLink.subselect,
							warnings,
							relations
						)
					);
				} else if (!isPgColumnRef(expr.rexpr!) && !isPgA_Const(expr.rexpr!)) {
					warnings.push(notSupported("where clause", whereClause));
				}
				break;
			default:
				warnings.push(notSupported("where clause", whereClause));
		}
	} else if (isPgBoolExpr(whereClause)) {
		const expr = whereClause.BoolExpr;
		for (const arg of expr.args!) {
			assignMap(params, getParamMapForWhereClause(arg, relations, warnings));
		}
	} else if (!isPgNullTest(whereClause)) {
		warnings.push(notSupported("where clause", whereClause));
	}

	return params;
};

export const getParamMapForUpdate = (
	stmt: PgUpdateStmt,
	warnings: Warning[]
) => {
	const params = new Map<number, Parameter>();

	const mainRelation = getRelation(stmt.UpdateStmt.relation!);
	for (const target of stmt.UpdateStmt.targetList!) {
		if (isPgResTarget(target)) {
			if (isPgParamRef(target.ResTarget.val!)) {
				params.set(target.ResTarget.val.ParamRef.number, {
					...mainRelation,
					column: target.ResTarget.name!,
					isArray: false
				});
			}
		} else {
			warnings.push(other("Target is not a ResTarget", target));
		}
	}

	if (stmt.UpdateStmt.whereClause) {
		const relations = getRelationsForUpdate(stmt);
		assignMap(
			params,
			getParamMapForWhereClause(
				stmt.UpdateStmt.whereClause,
				relations,
				warnings
			)
		);
	}

	return params;
};

export const getParamMapForInsert = (
	stmt: PgInsertStmt,
	warnings: Warning[]
) => {
	const params = new Map<number, Parameter>();

	const mainRelation = getRelation(stmt.InsertStmt.relation!);
	if (isPgSelectStmt(stmt.InsertStmt.selectStmt!)) {
		const select = stmt.InsertStmt.selectStmt.SelectStmt;
		if (select.valuesLists && stmt.InsertStmt.cols) {
			for (const valueList of select.valuesLists) {
				for (let i = 0; i < valueList.length; i++) {
					const value = valueList[i];
					if (isPgParamRef(value)) {
						const column = stmt.InsertStmt.cols[i];
						if (isPgResTarget(column)) {
							params.set(value.ParamRef.number, {
								...mainRelation,
								column: column.ResTarget.name!,
								isArray: false
							});
						} else {
							warnings.push(
								notSupported("colum type in select clause", column)
							);
						}
					}
				}
			}
		} else {
			warnings.push(notSupported("select clause", select));
		}
	}

	return params;
};

export const getParamMapForSelect = (
	stmt: PgSelectStmt,
	warnings: Warning[],
	parentRelations?: Map<Alias, Relation>
) => {
	const params = new Map<number, Parameter>();

	const relations = new Map<Alias, Relation>();
	assignMap(relations, parentRelations, getRelationsForSelect(stmt));

	if (stmt.SelectStmt.whereClause) {
		assignMap(
			params,
			getParamMapForWhereClause(
				stmt.SelectStmt.whereClause,
				relations,
				warnings
			)
		);
	}

	return params;
};

export const getParamMapForDelete = (
	stmt: PgDeleteStmt,
	warnings: Warning[]
) => {
	const params = new Map<number, Parameter>();

	if (stmt.DeleteStmt.whereClause) {
		const relations = getRelationsForDelete(stmt);
		assignMap(
			params,
			getParamMapForWhereClause(
				stmt.DeleteStmt.whereClause,
				relations,
				warnings
			)
		);
	}

	return params;
};
