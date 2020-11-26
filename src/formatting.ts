import { execSync } from "child_process";
import { format } from "pg-formatter";

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

export const formatText = (
	sql: string,
	indent: IndentStyleTabs | IndentStyleSpaces
): string => {
	return format(sql, {
		noRcFile: true,
		spaces: indent.style === "spaces" ? indent.number : undefined,
		tabs: indent.style === "tabs",
	});
};
