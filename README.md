# TypeScript SQL tagged template plugin

TypeScript server plugin that adds type checking for SQL queries tagged with an `sql` function.

![](docs/preview.gif)

**Features**

- Syntax errors for SQL statements
- Type checking for expressions in SQL statements

**Limitations**

- Currently only supports PostgreSQL

## Usage

This plugin can provides SQL syntax errors and type checking in TypeScript files within any editor that uses TypeScript to power their language features. This includes [VS Code](https://code.visualstudio.com) and any other editor using supporting TypeScript language server plugins.

### With VS Code

The simplest way to use this plugin is through the [SQL tagged template literals](https://marketplace.visualstudio.com/items?itemName=frigus02.vscode-sql-tagged-template-literals) extension. This extension automatically enables the plugin, and also adds syntax highlighting for SQL template strings and synchronization of settings between VS Code and the plugin.

### Other editors

First install the plugin in your project:

```bash
npm install --save-dev typescript-sql-tagged-template-plugin
```

Then add a `plugins` section to your [`tsconfig.json`](http://www.typescriptlang.org/docs/handbook/tsconfig-json.html).

```json
{
	"compilerOptions": {
		"plugins": [
			{
				"name": "typescript-sql-tagged-template-plugin"
			}
		]
	}
}
```

Then restart the TS language server.

## Configuration

If you are using the [SQL tagged template literals](https://marketplace.visualstudio.com/items?itemName=frigus02.vscode-sql-tagged-template-literals) extension for VS Code, you can configure these settings in the editor settings.

Otherwise you can configure the behavior of this plugin in the `plugins` section of in your `tsconfig`.

### Database schema

In order to do type checking for parameters in SQL statements, the plugin needs to know about your database schema. You can generate a JSON file with your DB schema using the script [scripts/schema/index.js](./scripts/schema/index.js). If you have a different DB type conversion, modify the file afterwards.

Then configure the path to the file using the `schemaFile` setting:

```json
{
	"compilerOptions": {
		"plugins": [
			{
				"name": "typescript-sql-tagged-template-plugin",
				"schemaFile": "./path/to/database-schema.json"
			}
		]
	}
}
```

### Default schema name

For queries not specifying any schema name (e.g. `SELECT * FROM users` instead of `SELECT * FROM myschema.users`), the plugin uses this as the default schema. The value defaults to `public`, which is the Postgres default.

```json
{
	"compilerOptions": {
		"plugins": [
			{
				"name": "typescript-sql-tagged-template-plugin",
				"defaultSchemaName": "public"
			}
		]
	}
}
```
