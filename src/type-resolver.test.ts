import { readdirSync } from "fs";
import { join as joinPath } from "path";
import * as ts from "typescript/lib/tsserverlibrary";
import { TypeResolver } from "./type-resolver";

const findTemplateExpression = (source: ts.SourceFile) => {
	const visit = (node: ts.Node): ts.Expression | undefined =>
		ts.isTemplateExpression(node)
			? node.templateSpans[0].expression
			: ts.forEachChild(node, visit);
	return ts.forEachChild(source, visit);
};

describe(TypeResolver, () => {
	const testProjectDir = joinPath(__dirname, "__testproject__");
	const files = readdirSync(testProjectDir);
	for (const file of files) {
		test(file, () => {
			const path = joinPath(testProjectDir, file);
			const program = ts.createProgram({
				rootNames: [path],
				options: {
					strict: true
				}
			});
			const source = program.getSourceFile(path);
			if (!source) {
				throw Error("Source file not found");
			}

			const node = findTemplateExpression(source);
			if (!node) {
				throw Error("Template expression not found");
			}

			const checker = new TypeResolver(ts, () => program.getTypeChecker());
			const type = checker.getType(node);
			expect(type).toMatchSnapshot();
		});
	}
});
