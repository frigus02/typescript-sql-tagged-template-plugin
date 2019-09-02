import { readdirSync } from "fs";
import { join as joinPath } from "path";
import * as ts from "typescript/lib/tsserverlibrary";
import { TypeResolver } from "./type-resolver";

const findFirstTemplateSpanExpression = (source: ts.SourceFile) => {
	const visit = (node: ts.Node): ts.Expression | undefined =>
		ts.isTemplateExpression(node)
			? node.templateSpans[0].expression
			: ts.forEachChild(node, visit);
	return ts.forEachChild(source, visit);
};

const findFirstTaggedTemplateExpression = (source: ts.SourceFile) => {
	const visit = (node: ts.Node): ts.Expression | undefined =>
		ts.isTaggedTemplateExpression(node) ? node : ts.forEachChild(node, visit);
	return ts.forEachChild(source, visit);
};

const testForEachFile = (
	testProject: string,
	callback: (program: ts.Program, source: ts.SourceFile) => void
) => {
	const testProjectDir = joinPath(__dirname, "__testprojects__", testProject);
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

			callback(program, source);
		});
	}
};

describe(TypeResolver, () => {
	describe(TypeResolver.prototype.getType, () => {
		testForEachFile("get-type", (program, source) => {
			const node = findFirstTemplateSpanExpression(source);
			if (!node) {
				throw Error("Template expression not found");
			}

			const checker = new TypeResolver(ts, () => program.getTypeChecker());
			const type = checker.getType(node);
			expect(type).toMatchSnapshot();
		});
	});

	describe(TypeResolver.prototype.getTypeOfFirstTypeArgument, () => {
		testForEachFile("get-type-of-first-type-argument", (program, source) => {
			const node = findFirstTaggedTemplateExpression(source);
			if (!node) {
				throw Error("Template expression not found");
			}

			const checker = new TypeResolver(ts, () => program.getTypeChecker());
			const type = checker.getTypeOfFirstTypeArgument(node);
			expect(type).toMatchSnapshot();
		});
	});
});
