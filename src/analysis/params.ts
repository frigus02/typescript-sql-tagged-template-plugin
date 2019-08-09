import {
	PgA_Expr_Kind,
	PgColumnRef,
	PgDeleteStmt,
	PgInsertStmt,
	PgNode,
	PgRangeVar,
	PgSelectStmt,
	PgUpdateStmt,
	PgA_Expr
} from "pg-query-emscripten";
import {
	isPgA_Const,
	isPgA_Expr,
	isPgBoolExpr,
	isPgColumnRef,
	isPgJoinExpr,
	isPgNodeArray,
	isPgNullTest,
	isPgParamRef,
	isPgRangeVar,
	isPgResTarget,
	isPgSelectStmt,
	isPgString,
	isPgSubLink,
	isPgInteger
} from "./pg-query-emscripten-type-guards";
import { assignMap, notSupported, other, Warning } from "./utils";

type Alias = string;

interface Relation {
	schema?: string;
	table: string;
}

export interface Parameter {
	schema?: string;
	table: string;
	column: string;
	jsonPath?: {
		path: string | number;
		isText: boolean;
	};
}

const COMPARISON_OPERATORS = ["<", ">", "<=", ">=", "=", "<>"];
const JSON_OPERATORS = ["->", "->>", "#>", "#>>"];
const JSON_OPERATORS_RETURNING_TEXT = ["->>", "#>>"];

const getColumn = (
	columnRef: PgColumnRef,
	relations: Map<Alias, Relation>,
	warnings: Warning[]
): Parameter => {
	if (columnRef.ColumnRef.fields!.length === 0) {
		throw new Error(`ColumnRef has no fields: ${JSON.stringify(columnRef)}`);
	}

	if (columnRef.ColumnRef.fields!.length > 2) {
		warnings.push(other("ColumnRef has more then 2 fields", columnRef));
	}

	const getField = (field: PgNode) => {
		if (isPgString(field)) {
			return field.String.str!;
		} else {
			throw new Error(
				`ColumnRef field has no name: ${JSON.stringify(columnRef)}`
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

const getRelation = (node: PgRangeVar): Relation => ({
	schema: node.RangeVar.schemaname,
	table: node.RangeVar.relname!
});

const getRelations = (node: PgNode) => {
	const relations = new Map<Alias, Relation>();

	if (isPgJoinExpr(node)) {
		assignMap(
			relations,
			getRelations(node.JoinExpr.larg!),
			getRelations(node.JoinExpr.rarg!)
		);
	} else if (isPgRangeVar(node)) {
		relations.set(
			node.RangeVar.alias ? node.RangeVar.alias.Alias.aliasname! : "",
			getRelation(node)
		);
	}

	return relations;
};

const getRelationsForFromClause = (fromClause: PgNode[]) => {
	const relations = new Map<Alias, Relation>();
	assignMap(relations, ...fromClause.map(getRelations));
	return relations;
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
						const column = getColumn(expr.lexpr, relations, warnings);
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
					if (isPgColumnRef(expr.lexpr!)) {
						params.set(
							expr.rexpr.ParamRef.number,
							getColumn(expr.lexpr, relations, warnings)
						);
					} else if (
						isPgA_Expr(expr.lexpr!) &&
						JSON_OPERATORS.includes(getOperator(expr.lexpr) || "") &&
						isPgColumnRef(expr.lexpr.A_Expr.lexpr!) &&
						isPgA_Const(expr.lexpr.A_Expr.rexpr!)
					) {
						const operator = getOperator(expr.lexpr)!;
						const pathVal = expr.lexpr.A_Expr.rexpr.A_Const.val;
						params.set(expr.rexpr.ParamRef.number, {
							...getColumn(expr.lexpr.A_Expr.lexpr, relations, warnings),
							jsonPath: {
								path: isPgInteger(pathVal)
									? pathVal.Integer.ival
									: isPgString(pathVal)
									? pathVal.String.str!
									: "<UNKNOWN>",
								isText: JSON_OPERATORS_RETURNING_TEXT.includes(operator)
							}
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
					column: target.ResTarget.name!
				});
			}
		} else {
			warnings.push(other("Target is not a ResTarget", target));
		}
	}

	if (stmt.UpdateStmt.whereClause) {
		const relations = getRelations(stmt.UpdateStmt.relation!);
		if (stmt.UpdateStmt.fromClause) {
			assignMap(
				relations,
				getRelationsForFromClause(stmt.UpdateStmt.fromClause)
			);
		}

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
								column: column.ResTarget.name!
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
	assignMap(
		relations,
		parentRelations,
		stmt.SelectStmt.fromClause &&
			getRelationsForFromClause(stmt.SelectStmt.fromClause)
	);

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
		const relations = getRelations(stmt.DeleteStmt.relation!);
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
