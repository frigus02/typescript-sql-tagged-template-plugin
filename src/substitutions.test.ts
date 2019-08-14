import { getSubstitutions } from "./substitutions";

describe(getSubstitutions, () => {
	const templateString =
		"SELECT * FROM users WHERE id = ${userId} AND age > ${age};";

	it("replaces expressions with SQL parameters", () => {
		const result = getSubstitutions(templateString, [
			{ start: 31, end: 40 },
			{ start: 51, end: 57 }
		]);

		expect(result).toBe(
			"SELECT * FROM users WHERE id = $1        AND age > $2    ;"
		);
	});

	it("keeps resulting string the same length as the original template string", () => {
		const result = getSubstitutions(templateString, [
			{ start: 31, end: 40 },
			{ start: 51, end: 57 }
		]);

		expect(result.length).toBe(templateString.length);
	});

	it("throws if it cannot keep the string the same length", () => {
		expect(() =>
			getSubstitutions(templateString, [{ start: 10, end: 11 }])
		).toThrow("Substitution is longer than expression.");
	});
});
