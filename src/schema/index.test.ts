import { parseSchema } from "./index";

describe(parseSchema, () => {
	it("returns parsed database schema", () => {
		expect(parseSchema(`{"public": {"users": {"id": "number"}}}`)).toEqual({
			public: {
				users: {
					id: "number",
				},
			},
		});
	});

	it("throws if schema is invalid JSON", () => {
		expect(() => parseSchema("{error,}")).toThrow(
			"Unexpected token e in JSON at position 1"
		);
	});

	it("throws if schema is not a valid DatabaseSchema", () => {
		expect(() => parseSchema(`{"users": {"id": "number"}}`)).toThrow(
			"Schema does not conform to database schema type"
		);
	});
});
