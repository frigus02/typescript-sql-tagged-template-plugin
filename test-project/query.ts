export interface Query<T> {
	_?: T;
	name?: string;
	text: string;
	values: any[];
}

export const sql = <T>(name: string) => (
	strings: TemplateStringsArray,
	...values: any[]
): Query<T> => ({
	name,
	text: String.raw(strings, ...values.map((_, i) => `$${i + 1}`)),
	values
});

export const findAll = async <T>(query: Query<T>): Promise<T[]> => {
	await Promise.resolve(query);
	return [];
};

export const findOne = async <T>(query: Query<T>): Promise<T | undefined> => {
	const rows = await findAll(query);
	if (rows.length === 1) {
		return rows[0];
	}
};
