import { execSync } from "child_process";
import { format } from "pg-formatter";
import { analyze } from "./analysis";

export const detectPerl = (): boolean => {
	try {
		execSync("perl -v");
		return true;
	} catch (err) {
		return false;
	}
};

interface IndentStyleTabs {
	style: "tabs";
}

interface IndentStyleSpaces {
	style: "spaces";
	number: number;
}

export const formatSql = ({
	sql,
	indent,
	newLine,
}: {
	sql: string;
	indent: IndentStyleTabs | IndentStyleSpaces;
	newLine: string;
}): string => {
	try {
		return format(sql, {
			noRcFile: true,
			spaces: indent.style === "spaces" ? indent.number : undefined,
			tabs: indent.style === "tabs",
		}).replace(/(\r\n|\r|\n)/g, newLine);
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
