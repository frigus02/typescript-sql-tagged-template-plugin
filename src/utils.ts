export const flatten = <T>(arr: T[][]): T[] =>
	arr.reduce((acc, innerArr) => [...acc, ...innerArr], []);
