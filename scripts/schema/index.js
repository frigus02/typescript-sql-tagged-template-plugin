const { relative: relativePath } = require("path");
const { exportSchema } = require("./db");
const { mapSchemaToTypeScriptTypes } = require("./ts");

const generateSchema = async (schemaNames) => {
	const schema = await exportSchema(schemaNames);
	const mappedSchema = mapSchemaToTypeScriptTypes(schema);
	const json = JSON.stringify(mappedSchema, null, 4);
	console.log(json);
};

const printUsage = () => {
	const node = process.argv0;
	const program = relativePath(process.cwd(), process.argv[1]);
	console.log(`Usage: ${node} ${program} [SCHEMA_NAME...]`);
	console.log("");
	console.log(
		"Use the Postgres environment variables to configure connection to the database, e.g. PGHOST, PGPORT, PGDATABASE, PGUSER and PGPASSWORD."
	);
	console.log("");
	console.log(
		`Example: PGHOST=localhost PGUSER=postgres PGPASSWORD=secret ${node} ${program} schema.json public`
	);
};

const main = async () => {
	const args = process.argv.slice(2);
	if (args.length === 1 && (args[0] === "-h" || args[0] === "--help")) {
		printUsage();
	} else {
		const [...schemaNames] = args;
		await generateSchema(schemaNames);
	}
};

main().catch((err) => {
	console.error("Error generating schema:", err, "\n");
	printUsage();
	process.exitCode = 1;
});
