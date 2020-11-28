import {
	formatSql,
	splitSqlByParameters,
	indentForTemplateLiteral,
} from "./formatting";

describe(formatSql, () => {
	test("it works", () => {
		const sql =
			"SELECT order_id, status, description FROM orders WHERE user_id = $1 AND status = ANY($2)";
		const formatOptions = {};
		expect(formatSql({ sql, formatOptions })).toEqual(
			"SELECT\n\torder_id,\n\tstatus,\n\tdescription\nFROM\n\torders\nWHERE\n\tuser_id = $1\n\tAND status = ANY ($2)\n"
		);
	});
});

describe(splitSqlByParameters, () => {
	test("no parameters", () => {
		const sql = "SELECT 1";
		expect(splitSqlByParameters(sql, 0)).toEqual(["SELECT 1"]);
	});

	test("ordered parameters", () => {
		const sql =
			"SELECT * FROM orders WHERE user_id = $1 AND status = ANY($2)";
		expect(splitSqlByParameters(sql, 2)).toEqual([
			"SELECT * FROM orders WHERE user_id = ",
			" AND status = ANY(",
			")",
		]);
	});

	test("only splits at parameter <= numberOfParameters", () => {
		const sql =
			"SELECT * FROM orders WHERE user_id = $1 AND status = ANY($2)";
		expect(splitSqlByParameters(sql, 1)).toEqual([
			"SELECT * FROM orders WHERE user_id = ",
			" AND status = ANY($2)",
		]);
	});

	test("throws when available parameters < numberOfParameters 1", () => {
		const sql =
			"SELECT * FROM orders WHERE user_id = $1 AND status = ANY($2)";
		expect(() => splitSqlByParameters(sql, 3)).toThrow();
	});

	test("throws when available parameters < numberOfParameters 2", () => {
		const sql =
			"SELECT * FROM orders WHERE user_id = $1 AND other_user != $1";
		expect(() => splitSqlByParameters(sql, 2)).toThrow();
	});

	test("only splits on first occurrence of duplicate parameter", () => {
		const sql =
			"SELECT * FROM orders WHERE user_id = $1 AND status = ANY($2) AND other_user != $1";
		expect(splitSqlByParameters(sql, 2)).toEqual([
			"SELECT * FROM orders WHERE user_id = ",
			" AND status = ANY(",
			") AND other_user != $1",
		]);
	});
});

describe(indentForTemplateLiteral, () => {
	test("simple case", () => {
		const text = "SELECT\n\t1\n";
		const formatOptions = {
			convertTabsToSpaces: false,
			indentSize: 4,
			tabSize: 4,
			newLineCharacter: "\n",
		};
		expect(
			indentForTemplateLiteral({ text, formatOptions, lineIndent: 8 })
		).toBe("\n\t\t\tSELECT\n\t\t\t\t1\n\t\t");
	});

	test("line indent doesn't divide by tab size", () => {
		const text = "SELECT\n\t1\n";
		const formatOptions = {
			convertTabsToSpaces: false,
			indentSize: 4,
			tabSize: 4,
			newLineCharacter: "\n",
		};
		expect(
			indentForTemplateLiteral({ text, formatOptions, lineIndent: 6 })
		).toBe("\n\t\t\tSELECT\n\t\t\t\t1\n\t\t");
	});
});
