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

export const formatText = (sql: string, spaces?: number): string => {
	return format(sql, { spaces });
};
