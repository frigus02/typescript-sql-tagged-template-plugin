const { spawn } = require("child_process");
const { mkdir, rm, readdir, copyFile } = require("fs").promises;
const { join: joinPath, resolve: resolvePath } = require("path");

const PG_FORMATTER_VERSION = "v4.4";
const VENDOR_DIR = resolvePath(__dirname, "../../vendor/pgFormatter");
const TMP_DIR = resolvePath(__dirname, "../../tmp-pgFormatter");

const exec = (cmd, args, options) => {
	console.log(`$ ${cmd} ${args.join(" ")}`);
	const proc = spawn(cmd, args, {
		...options,
		stdio: "inherit",
	});
	return new Promise((resolve, reject) => {
		proc.on("close", (code) => {
			if (code === 0) {
				resolve();
			} else {
				reject(new Error(`child process exited with code ${code}`));
			}
		});
	});
};

const cpDir = async (from, to, fileFilter) => {
	const allFiles = await readdir(from, { withFileTypes: true });
	const files = allFiles.filter(
		(file) =>
			file.isDirectory() ||
			(file.isFile() && fileFilter(joinPath(from, file.name)))
	);
	for (const file of files) {
		const src = joinPath(from, file.name);
		const dst = joinPath(to, file.name);
		if (file.isDirectory()) {
			await cpDir(src, dst, fileFilter);
		} else {
			console.log(`Copy file ${src} to ${dst}`);
			await mkdir(to, { recursive: true });
			await copyFile(src, dst);
		}
	}
};

const main = async () => {
	await rm(TMP_DIR, { recursive: true, force: true });
	await exec("git", [
		"clone",
		"--branch",
		PG_FORMATTER_VERSION,
		"--depth",
		"1",
		"https://github.com/darold/pgFormatter.git",
		TMP_DIR,
	]);

	await rm(VENDOR_DIR, { recursive: true, force: true });
	await mkdir(VENDOR_DIR, { recursive: true });
	await cpDir(
		TMP_DIR,
		VENDOR_DIR,
		(file) =>
			file === joinPath(TMP_DIR, "LICENSE") ||
			file === joinPath(TMP_DIR, "pg_format") ||
			file.startsWith(joinPath(TMP_DIR, "lib"))
	);

	await rm(TMP_DIR, { recursive: true, force: true });
};

main().catch((err) => {
	console.error(err);
	process.exitCode = 1;
});
