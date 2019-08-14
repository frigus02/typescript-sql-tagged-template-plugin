import { flatten } from "./utils";

describe(flatten, () => {
	it("flattens array", () => {
		expect(flatten([[1, 2], [3, 4]])).toEqual([1, 2, 3, 4]);
	});
});
