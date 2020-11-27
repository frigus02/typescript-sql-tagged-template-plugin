import { readdirSync, readFileSync } from "fs";
import { join as joinPath } from "path";
import { analyze } from ".";

describe("analyze snapshots", () => {
	const testcaseDir = joinPath(__dirname, "__testcases__");
	const files = readdirSync(testcaseDir);
	for (const file of files) {
		const sql = readFileSync(joinPath(testcaseDir, file), "utf8");
		test(file, () => {
			const result = analyze(sql);
			expect(result).toMatchSnapshot();
		});
	}
});

describe(analyze, () => {
	test("parameter location", () => {
		const sql =
			"SELECT * FROM orders WHERE user_id = $1 AND status = ANY($2)";
		const result = analyze(sql);
		expect(result.parameters.length).toBe(2);

		const p1 = result.parameters[0];
		const p1Text = "$" + p1.index;
		const p1TextFromLoc = sql.substr(p1.location, p1Text.length);
		expect(p1TextFromLoc).toBe(p1Text);

		const p2 = result.parameters[1];
		const p2Text = "$" + p2.index;
		const p2TextFromLoc = sql.substr(p2.location, p2Text.length);
		expect(p2TextFromLoc).toBe(p2Text);
	});
});
