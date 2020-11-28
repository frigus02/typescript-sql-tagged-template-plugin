declare module "pg-formatter" {
	interface UserConfiguration {
		anonymize?: boolean;
		functionCase?: "unchanged" | "lowercase" | "uppercase" | "capitalize";
		keywordCase?: "unchanged" | "lowercase" | "uppercase" | "capitalize";
		noRcFile?: boolean;
		placeholder?: string;
		spaces?: number;
		stripComments?: boolean;
		tabs?: boolean;
	}

	function format(sql: string, userConfiguration?: UserConfiguration): string;
}
