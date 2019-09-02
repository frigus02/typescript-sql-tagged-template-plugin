import {
	PgNode,
	PgRangeVar,
	PgUpdateStmt,
	PgInsertStmt,
	PgSelectStmt,
	PgDeleteStmt
} from "pg-query-emscripten";
import { isPgJoinExpr, isPgRangeVar } from "./pg-query-emscripten-type-guards";
import { assignMap } from "./utils";

export type Alias = string;

export interface Relation {
	schema?: string;
	table: string;
}

export const getRelation = (node: PgRangeVar): Relation => ({
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

export const getRelationsForUpdate = (stmt: PgUpdateStmt) => {
	const relations = getRelations(stmt.UpdateStmt.relation!);
	if (stmt.UpdateStmt.fromClause) {
		assignMap(relations, getRelationsForFromClause(stmt.UpdateStmt.fromClause));
	}

	return relations;
};

export const getRelationsForInsert = (stmt: PgInsertStmt) =>
	getRelations(stmt.InsertStmt.relation!);

export const getRelationsForSelect = (stmt: PgSelectStmt) => {
	const relations = new Map<Alias, Relation>();
	assignMap(
		relations,
		stmt.SelectStmt.fromClause &&
			getRelationsForFromClause(stmt.SelectStmt.fromClause)
	);

	return relations;
};

export const getRelationsForDelete = (stmt: PgDeleteStmt) =>
	getRelations(stmt.DeleteStmt.relation!);
