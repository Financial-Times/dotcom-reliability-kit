#!/usr/bin/env node
// biome-ignore-all lint/suspicious/noConsole: only used in local dev

import fs from 'node:fs/promises';
import path from 'node:path';
import releasePleaseManifest from '../.release-please-manifest.json' with { type: 'json' };
import rootManifest from '../package.json' with { type: 'json' };
import releasePleaseConfig from '../release-please-config.json' with { type: 'json' };

// Get the package name
const name = process.argv[2];
if (!name) {
	throw new Error('No package name provided');
}

// Create the package directory
const packagePath = path.resolve(import.meta.dirname, '..', 'packages', name);
console.log(`📂 creating package directory "packages/${name}"`);
await fs.mkdir(packagePath);

// Create a package manifest
const manifest = {
	name: `@dotcom-reliability-kit/${name}`,
	version: '0.0.0',
	type: 'module',
	description: 'TODO',
	repository: {
		type: 'git',
		url: 'https://github.com/Financial-Times/dotcom-reliability-kit.git',
		directory: `packages/${name}`
	},
	homepage: `https://github.com/Financial-Times/dotcom-reliability-kit/tree/main/packages/${name}#readme`,
	bugs: `https://github.com/Financial-Times/dotcom-reliability-kit/issues?q=label:"package: ${name}"`,
	license: rootManifest.license,
	scripts: {
		test: 'npm run test:unit && npm run test:end-to-end',
		'test:unit':
			"node --test --experimental-test-module-mocks --experimental-test-coverage --test-coverage-exclude='**/*.spec.js' --test-coverage-branches=100 --test-coverage-functions=100 --test-coverage-lines=100 'test/unit/**/*.spec.js'",
		'test:end-to-end': "node --test 'test/end-to-end/**/*.spec.js'"
	},
	engines: rootManifest.engines,
	exports: {
		'.': {
			types: './types/index.d.ts',
			default: './lib/index.js'
		}
	}
};
console.log('📦 initialising "package.json"');
await fs.writeFile(path.join(packagePath, 'package.json'), JSON.stringify(manifest, null, 2));

console.log('📖 writing "README.md"');
await fs.writeFile(
	path.join(packagePath, 'README.md'),
	`
# @dotcom-reliability-kit/${name}

This module is part of [FT.com Reliability Kit](https://github.com/Financial-Times/dotcom-reliability-kit#readme).
`
);

// Create an npm ignore file
console.log('📄 adding ".npmignore"');
await fs.writeFile(
	path.join(packagePath, '.npmignore'),
	['CHANGELOG.md', 'docs', 'test'].join('\n')
);

// Bootstrap base JavaScript files
console.log('🏗  adding "lib/index.js"');
const libPath = path.join(packagePath, 'lib');
await fs.mkdir(libPath);
await fs.writeFile(
	path.join(libPath, 'index.js'),
	`export {};
`
);
console.log('🏗  adding "types/index.d.ts"');
const typesPath = path.join(packagePath, 'types');
await fs.mkdir(typesPath);
await fs.writeFile(
	path.join(typesPath, 'index.d.ts'),
	`declare module '@dotcom-reliability-kit/${name}' {}
`
);

// Bootstrap test JavaScript files
console.log('🏗  adding "test/unit/lib/index.spec.js"');
const testPath = path.join(packagePath, 'test', 'unit', 'lib');
await fs.mkdir(testPath, { recursive: true });
await fs.writeFile(
	path.join(testPath, 'index.spec.js'),
	`import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

describe('@dotcom-reliability-kit/${name}', () => {
	it('has some tests', () => {
		assert.strictEqual(true, false);
	});
});
`
);

// Add package to Release Please config
console.log('🚢 adding package to Release Please config');
releasePleaseConfig.packages[`packages/${name}`] = {};
await fs.writeFile(
	path.resolve(import.meta.dirname, '..', 'release-please-config.json'),
	JSON.stringify(releasePleaseConfig, null, '\t')
);

console.log('🚢 adding package to Release Please manifest');
releasePleaseManifest[`packages/${name}`] = '0.0.0';
await fs.writeFile(
	path.resolve(import.meta.dirname, '..', '.release-please-manifest.json'),
	JSON.stringify(releasePleaseManifest, null, '\t')
);
