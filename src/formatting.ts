import { spawnSync } from "child_process";
import { resolve as resolvePath } from "path";
import * as ts from "typescript/lib/tsserverlibrary";
import { analyze } from "./analysis";

const DEFAULT_TAB_SIZE = 4;
const DEFAULT_INDENT_SIZE = 4;
const DEFAULT_NEW_LINE_CHARACTER = "\n";
const PG_FORMATTER_PATH = resolvePath(
	__dirname,
	"../vendor/pgFormatter/pg_format"
);

export const detectPerl = (): boolean => {
	const proc = spawnSync("perl", ["-v"]);
	return proc.status === 0;
};

export const formatSql = ({
	sql,
	formatOptions,
	pgFormatterConfigFile,
}: {
	sql: string;
	formatOptions: ts.EditorSettings;
	pgFormatterConfigFile?: string;
}): string => {
	const useSpaces = formatOptions.convertTabsToSpaces ?? false;
	const indentSize = formatOptions.indentSize ?? DEFAULT_INDENT_SIZE;
	const proc = spawnSync(
		"perl",
		[
			PG_FORMATTER_PATH,
			...(pgFormatterConfigFile
				? ["--config", pgFormatterConfigFile]
				: ["--no-rcfile"]),
			...(useSpaces ? ["--spaces", indentSize.toString()] : ["--tabs"]),
		],
		{
			encoding: "utf8",
			input: sql,
		}
	);
	if (proc.error) {
		throw new Error(`pgFormatter failed: ${proc.error.message}`);
	}
	if (proc.status !== 0) {
		throw new Error(
			`pgFormatter exited with ${proc.status}: ${proc.stderr}`
		);
	}

	return proc.stdout.replace(
		/(\r\n|\r|\n)/g,
		formatOptions.newLineCharacter ?? DEFAULT_NEW_LINE_CHARACTER
	);
};

export const splitSqlByParameters = (
	sql: string,
	numberOfParameters: number
): string[] => {
	const analysis = analyze(sql);
	const parameters = analysis.parameters
		.filter((parameter) => parameter.index <= numberOfParameters)
		// Remove duplicate indexes (e.g. two times $1) and keep only the
		// parameter that occurs first.
		.sort((a, b) => {
			const byIndex = a.index - b.index;
			if (byIndex !== 0) {
				return byIndex;
			}

			return a.location - b.location;
		})
		.filter(
			(parameter, index, array) =>
				index === 0 || array[index - 1].index !== parameter.index
		)
		// Sort by location
		.sort((a, b) => a.location - b.location);

	if (parameters.length !== numberOfParameters) {
		throw new Error(
			`SQL does not contain expected number of parameters (expected: ${numberOfParameters}, actual: ${parameters.length})`
		);
	}

	const parts = [];
	let end = 0;
	for (const parameter of parameters) {
		const pText = "$" + parameter.index;
		parts.push(sql.substring(end, parameter.location));
		end = parameter.location + pText.length;
	}

	parts.push(sql.substring(end));
	return parts;
};

export const indentForTemplateLiteral = ({
	text,
	formatOptions,
	lineIndent,
}: {
	text: string;
	formatOptions: ts.EditorSettings;
	lineIndent: number;
}): string => {
	const useSpaces = formatOptions.convertTabsToSpaces ?? false;
	const indentSize = formatOptions.indentSize ?? DEFAULT_INDENT_SIZE;
	const tabSize = formatOptions.tabSize ?? DEFAULT_TAB_SIZE;
	const newLineCharacter =
		formatOptions.newLineCharacter ?? DEFAULT_NEW_LINE_CHARACTER;

	return (
		newLineCharacter +
		text
			.split(newLineCharacter)
			.map((line, index, array) => {
				const isLast = index + 1 === array.length;
				const indent = isLast ? lineIndent : lineIndent + indentSize;
				const indentStr = useSpaces
					? " ".repeat(indent)
					: "\t".repeat(Math.ceil(indent / tabSize));
				return indentStr + line;
			})
			.join(newLineCharacter)
	);
};

export const getLineIndentationByNode = (
	node: ts.Node,
	scriptInfo: ts.server.ScriptInfo,
	formatOptions: ts.EditorSettings
): number => {
	const { line } = scriptInfo.positionToLineOffset(
		node.getStart(node.getSourceFile())
	);
	const lineSpan = scriptInfo.lineToTextSpan(line - 1);
	const lineText = scriptInfo
		.getSnapshot()
		.getText(lineSpan.start, lineSpan.start + lineSpan.length);

	// This logic is copied from:
	// https://github.com/microsoft/TypeScript/blob/ee570402769c3392d82a746fdf1416e4ce96304d/src/server/session.ts#L1728-1740
	let lineIndent = 0;
	for (let i = 0; i < lineText.length; i++) {
		if (lineText.charAt(i) === " ") {
			lineIndent++;
		} else if (lineText.charAt(i) === "\t") {
			lineIndent += formatOptions.tabSize ?? DEFAULT_TAB_SIZE;
		} else {
			break;
		}
	}

	return lineIndent;
};
