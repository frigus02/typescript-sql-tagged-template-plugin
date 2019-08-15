import { assignMap } from "./utils";

describe(assignMap, () => {
	it("copies values from source maps into destination map", () => {
		const dst = new Map<string, string>();
		const src1 = new Map<string, string>([["a", "1"], ["b", "2"]]);
		const src2 = new Map<string, string>([["c", "3"], ["b", "200"]]);
		assignMap(dst, src1, src2);

		expect(Array.from(dst.entries())).toEqual([
			["a", "1"],
			["b", "200"],
			["c", "3"]
		]);
	});

	it("ignores undefined source map arguments", () => {
		const dst = new Map<string, string>();
		const src = new Map<string, string>([["a", "1"]]);
		assignMap(dst, undefined, src, undefined);

		expect(Array.from(dst.entries())).toEqual([["a", "1"]]);
	});
});
