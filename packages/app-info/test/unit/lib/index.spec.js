import assert from 'node:assert/strict';
import { describe, it, mock } from 'node:test';

const gatherAppInfo = mock.fn(() => ({
	cloudProvider: 'mock-cloud-provider',
	commitHash: 'mock-commit-hash',
	environment: 'mock-environment',
	herokuAppId: 'mock-heroku-app-id',
	herokuDynoId: 'mock-heroku-dyno-id',
	instanceId: 'mock-instance-id',
	processType: 'mock-process-type',
	region: 'mock-region',
	releaseDate: 'mock-release-date',
	releaseVersion: 'mock-release-version',
	semanticConventions: 'mock-semantic-conventions',
	systemCode: 'mock-system-code'
}));
mock.module('../../../lib/gather-app-info.js', { defaultExport: gatherAppInfo });

mock.property(process, 'env', 'mock-process-env');
mock.method(process, 'cwd', () => 'mock-process-cwd');

const { default: appInfo, ...namedAppInfo } = await import('@dotcom-reliability-kit/app-info');

describe('@dotcom-reliability-kit/app-info', () => {
	it('calls `gatherAppInfo` with the process environment and current working directory', () => {
		assert.strictEqual(gatherAppInfo.mock.callCount(), 1);
		assert.deepStrictEqual(gatherAppInfo.mock.calls[0].arguments, [
			{
				env: 'mock-process-env',
				rootPath: 'mock-process-cwd'
			}
		]);
	});

	it('exports the gathered app info', () => {
		assert.deepStrictEqual(appInfo, {
			cloudProvider: 'mock-cloud-provider',
			commitHash: 'mock-commit-hash',
			environment: 'mock-environment',
			herokuAppId: 'mock-heroku-app-id',
			herokuDynoId: 'mock-heroku-dyno-id',
			instanceId: 'mock-instance-id',
			processType: 'mock-process-type',
			region: 'mock-region',
			releaseDate: 'mock-release-date',
			releaseVersion: 'mock-release-version',
			semanticConventions: 'mock-semantic-conventions',
			systemCode: 'mock-system-code'
		});
	});

	describe('default vs named exports', () => {
		it('has the same set of keys/values', () => {
			assert.deepStrictEqual(appInfo, namedAppInfo);
		});
	});
});
