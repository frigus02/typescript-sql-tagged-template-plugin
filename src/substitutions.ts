import { TemplateSettings } from "typescript-template-language-service-decorator";

export const getSubstitutions: Required<
	TemplateSettings
>["getSubstitutions"] = (templateString, spans) =>
	spans.reduce((str, span, i) => {
		const prefix = str.substring(0, span.start);
		const suffix = str.substring(span.end);
		const param = `$${i + 1}`;
		const paddingLength = span.end - span.start - param.length;
		if (paddingLength < 0) {
			throw new Error("Substitution is longer than expression.");
		}

		return prefix + param + " ".repeat(paddingLength) + suffix;
	}, templateString);
