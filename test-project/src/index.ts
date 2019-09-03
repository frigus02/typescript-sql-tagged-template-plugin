import { Client } from "pg";
import { findOne } from "./db";
import { createUser, createOrder } from "./queries";

const main = async () => {
	const client = new Client({
		host: "localhost",
		port: 5432,
		database: "postgres",
		user: "postgres",
		password: "mysecretpassword"
	});
	await client.connect();
	try {
		const user = await findOne(client, createUser("Peter", "Parker"));
		if (user) {
			const result = await client.query(createOrder(user.user_id, ""));
			console.log("Result", result);
		}
	} finally {
		await client.end();
	}
};

main().catch(err => {
	console.error(err);
	process.exitCode = 1;
});
