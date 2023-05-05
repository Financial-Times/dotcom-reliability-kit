#!/usr/bin/env node
/* eslint-disable no-console */

//internal
const Logger = require('../packages/logger/lib/index');
const eslintConfig = require('../packages/eslint-config/lib/index');

//external
const { glob } = require('glob');
const { ESLint } = require('eslint');
const fs = require('fs');
const path = require('node:path');

(async () => {
	try {
		// create an instance that extends the dotcom-reliability-kit/eslint-config via the imported module
		const eslint = new ESLint({
			useEslintrc: false,
			// @ts-ignore >> not able to fix this and doesn't stop the script from running fine
			overrideConfig: eslintConfig
		});

		// specify folderpath to lint
		const folderPath = path.join(
			__dirname,
			'..',
			'..',
			'clone-all-ft-cp-repos',
			'repos'
		);

		// fs.readdirSync returns an array of folderPaths, so filtering out unwanted folderpaths or it'll throw an error
		const ignoreFolderList = ['.DS_Store'];

		const arrayOfFolderPaths = fs
			.readdirSync(folderPath)
			.filter((folder) => !ignoreFolderList.includes(folder));

		// now we have an array of folders to loop through...
		for (const folder of arrayOfFolderPaths) {
			// ... and only store the files that have a glob path with files ending in *.js...
			const jsfiles = await glob(`${folderPath}/${folder}/**/*.js`);

			// ... and then lint these *.js files...
			const results = await eslint.lintFiles(jsfiles);

			// ... and then format the results...
			const formatter = await eslint.loadFormatter('stylish');
			const resultText = formatter.format(results);

			// ... and finally, output the results via the console
			console.log(resultText);
		}
	} catch (error) {
		process.exitCode = 1;
		Logger.error(error);
	}
})();
