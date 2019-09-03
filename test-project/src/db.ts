import { Client } from "pg";

export interface Query<T> {
	_?: T;
	name?: string;
	text: string;
	values: any[];
}

export const sql = <T = void>(name: string) => (
	strings: TemplateStringsArray,
	...values: any[]
): Query<T> => ({
	name,
	text: String.raw(strings, ...values.map((_, i) => `$${i + 1}`)),
	values
});

export const findAll = async <T>(
	client: Client,
	query: Query<T>
): Promise<T[]> => {
	const { rows } = await client.query(query);
	return rows;
};

export const findOne = async <T>(
	client: Client,
	query: Query<T>
): Promise<T | undefined> => {
	const rows = await findAll(client, query);
	if (rows.length === 1) {
		return rows[0];
	}
};
