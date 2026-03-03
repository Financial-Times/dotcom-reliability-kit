#!/usr/bin/env node

// biome-ignore-all lint/suspicious/noConsole: only used in local dev

import { glob, readFile, writeFile } from 'node:fs/promises';
import { basename, dirname, extname, join, relative, resolve } from 'node:path';
import amaro from 'amaro';

try {
	const cwd = process.cwd();
	console.log(`Stripping types in ${cwd}`);

	// Work out what paths we should be compiling
	const tsconfigPath = join(cwd, 'tsconfig.json');
	let includeGlobs: string[] = ['**/*.ts'];
	let excludeGlobs: string[] = [];
	try {
		const { default: tsconfig } = await import(tsconfigPath, { with: { type: 'json' } });
		if (tsconfig) {
			if (
				Array.isArray(tsconfig?.include) &&
				tsconfig.include.every((item: unknown) => typeof item === 'string')
			) {
				includeGlobs = tsconfig.include;
			}
			if (
				Array.isArray(tsconfig?.exclude) &&
				tsconfig.exclude.every((item: unknown) => typeof item === 'string')
			) {
				excludeGlobs = tsconfig.exclude;
			}
		}
	} catch (_) {
		console.warn('No tsconfig.json file found, guessing source paths');
	}

	// Always exclude type definitions
	excludeGlobs.push('**/*.d.ts');

	// Find and strip types in all files
	for await (const filePath of glob(includeGlobs, { cwd, exclude: excludeGlobs })) {
		const inputPath = resolve(cwd, filePath);
		const extension = extname(filePath);
		if (extension === '.ts') {
			const outputPath = join(dirname(filePath), `${basename(filePath, extension)}.js`);
			console.log(
				`Stripping types for ${relative(cwd, inputPath)} → ${relative(cwd, outputPath)}`
			);

			// FIXME: imported paths don't get rewritten from `.ts` to `.js`, which is probably quite a big
			// (and potentially blocking) task
			const { code } = amaro.transformSync(await readFile(inputPath, 'utf-8'));
			await writeFile(outputPath, code);
		}
	}
} catch (error) {
	console.error(error instanceof Error ? error.stack : error);
	process.exit(1);
}
