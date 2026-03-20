#!/usr/bin/env node
// biome-ignore-all lint/suspicious/noConsole: only used in local dev

import { glob, mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import releasePleaseManifest from '../../.release-please-manifest.json' with { type: 'json' };
import releasePleaseConfig from '../../release-please-config.json' with { type: 'json' };
import typeScriptBuildConfig from '../../tsconfig.build.json' with { type: 'json' };

// Get the package name
const name = process.argv[2];
if (!name) {
	console.error('❌ No package name provided');
	process.exit(1);
}
if (!/^[a-z][a-z0-9-]+$/.test(name)) {
	console.error('❌ Package name must be lowercase and alphanumeric with dashes');
	process.exit(1);
}

// Get other package details
const year = new Date().getFullYear();

// Create the package directory
const packagePath = resolve(import.meta.dirname, '..', '..', 'packages', name);
console.log(`📂 creating package directory "packages/${name}"`);
await mkdir(packagePath, { recursive: true });

// Copy across all template files
const templatePath = join(import.meta.dirname, 'template');
for await (const template of glob('**/*.*', { cwd: templatePath })) {
	const inputPath = join(templatePath, template);
	const outputPath = join(packagePath, template);
	await mkdir(dirname(outputPath), { recursive: true });

	const input = await readFile(inputPath, 'utf-8');
	const output = input.replaceAll('{{name}}', name).replaceAll('{{year}}', `${year}`);

	console.log(`📝 writing "${template}"`);
	await writeFile(outputPath, output);
}

// Add package to Release Please config (re-ordering the packages)
console.log('🚢 adding package to Release Please config');
releasePleaseConfig.packages[`packages/${name}`] = {};
releasePleaseConfig.packages = Object.fromEntries(
	Object.entries(releasePleaseConfig.packages).toSorted(([a], [b]) => (a > b ? 1 : -1))
) as typeof releasePleaseConfig.packages;
await writeFile(
	resolve(import.meta.dirname, '..', '..', 'release-please-config.json'),
	`${JSON.stringify(releasePleaseConfig, null, '\t')}\n`
);

console.log('🚢 adding package to Release Please manifest');
releasePleaseManifest[`packages/${name}`] = '0.0.0';
const sortedReleasePleaseManifest = Object.fromEntries(
	Object.entries(releasePleaseManifest).toSorted(([a], [b]) => (a > b ? 1 : -1))
) as typeof releasePleaseManifest;
await writeFile(
	resolve(import.meta.dirname, '..', '..', '.release-please-manifest.json'),
	JSON.stringify(sortedReleasePleaseManifest, null, 2) // Must be two spaces because Release Please sets it to this
);

// Add package to TypeScript build config
console.log('🏗️ adding package to TypeScript build config');
if (!typeScriptBuildConfig.references.find(({ path }) => path === `packages/${name}`)) {
	typeScriptBuildConfig.references.push({ path: `packages/${name}` });
	typeScriptBuildConfig.references = typeScriptBuildConfig.references.toSorted(
		({ path: a }, { path: b }) => (a > b ? 1 : -1)
	);
	await writeFile(
		resolve(import.meta.dirname, '..', '..', 'tsconfig.build.json'),
		`${JSON.stringify(typeScriptBuildConfig, null, '\t')}\n`
	);
}
