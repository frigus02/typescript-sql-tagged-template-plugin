import { execSync } from "child_process";
import { format } from "pg-formatter";
import * as ts from "typescript/lib/tsserverlibrary";
import { analyze } from "./analysis";

export const detectPerl = (): boolean => {
	try {
		execSync("perl -v");
		return true;
	} catch (err) {
		return false;
	}
};

export const formatSql = ({
	sql,
	formatOptions,
}: {
	sql: string;
	formatOptions: ts.EditorSettings;
}): string => {
	const useSpaces = formatOptions.convertTabsToSpaces ?? false;
	try {
		return format(sql, {
			noRcFile: true,
			spaces: useSpaces ? formatOptions.indentSize ?? 4 : undefined,
			tabs: !useSpaces,
		}).replace(/(\r\n|\r|\n)/g, formatOptions.newLineCharacter ?? "\n");
	} catch (err) {
		throw new Error(`pgFormatter failed: ${err.message}`);
	}
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
	lineIndentSize,
}: {
	text: string;
	formatOptions: ts.EditorSettings;
	lineIndentSize: number;
}): string => {
	const useSpaces = formatOptions.convertTabsToSpaces ?? false;
	const indentChar = useSpaces ? " " : "\t";
	const indentSize = useSpaces ? formatOptions.indentSize ?? 4 : 1;
	const newLineCharacter = formatOptions.newLineCharacter ?? "\n";
	if (!useSpaces) {
		lineIndentSize /= formatOptions.indentSize ?? 4;
	}

	return (
		newLineCharacter +
		text
			.split(newLineCharacter)
			.map((line, index, array) => {
				const isLast = index + 1 === array.length;
				const indent = indentChar.repeat(
					isLast ? lineIndentSize : lineIndentSize + indentSize
				);
				return indent + line;
			})
			.join(newLineCharacter)
	);
};
