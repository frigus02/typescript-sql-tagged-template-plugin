import { readdirSync, readFileSync } from "fs";
import { join as joinPath } from "path";
import { analyze } from ".";

describe(analyze, () => {
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
