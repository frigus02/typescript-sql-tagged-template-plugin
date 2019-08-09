const { writeFile } = require("fs").promises;
const { exportSchema } = require("./db");
const { mapSchemaToTypeScriptTypes } = require("./ts");

const updateFile = async (filePath, schemaNames) => {
	const schema = await exportSchema(schemaNames);
	const mappedSchema = mapSchemaToTypeScriptTypes(schema);
	const json = JSON.stringify(mappedSchema, null, 4);
	await writeFile(filePath, json, "utf8");
};

const main = async () => {
	const args = process.argv.slice(2);
	if (args.length < 1) {
		console.log(
			`Usage: ${process.argv[0]} ${process.argv[1]} OUT_FILE [SCHEMA_NAME...]`
		);
		process.exit(1);
	}

	const [filePath, ...schemaNames] = args;
	await updateFile(filePath, schemaNames);
};

main().catch(err => {
	console.error(err);
	process.exitCode = 1;
});
