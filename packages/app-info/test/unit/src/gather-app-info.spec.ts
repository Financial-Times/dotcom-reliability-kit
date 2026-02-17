// @ts-nocheck
import assert from 'node:assert/strict';
import path from 'node:path';
import { beforeEach, describe, it, mock } from 'node:test';
import type { AppInfo } from '../../../src/gather-app-info.js';

const crypto = { randomUUID: mock.fn(() => 'mock-generated-uuid') };
mock.module('node:crypto', { defaultExport: crypto, namedExports: crypto });
const fixtures = path.resolve(import.meta.dirname, '..', 'fixtures');

const defaultEnv = {
	AWS_LAMBDA_FUNCTION_VERSION: 'mock-aws-release-version',
	AWS_LAMBDA_FUNCTION_NAME: 'mock-lambda-function-name',
	AWS_REGION: 'mock-aws-region',
	GIT_COMMIT: 'mock-git-commit',
	GIT_COMMIT_LONG: 'mock-git-commit-long',
	HEROKU_RELEASE_CREATED_AT: 'mock-heroku-release-date',
	HEROKU_RELEASE_VERSION: 'mock-heroku-release-version',
	HEROKU_SLUG_COMMIT: 'mock-heroku-commit-hash',
	DEPLOYMENT_ENVIRONMENT: 'mock-deployment-environment',
	RELEASE_ENV: 'mock-release-env',
	ENVIRONMENT: 'mock-environment',
	NODE_ENV: 'mock-node-env',
	REGION: 'mock-region',
	SYSTEM_CODE: 'mock-system-code',
	DYNO: 'mock-heroku-process-type.1',
	HEROKU_APP_ID: 'mock-heroku-app-id',
	HEROKU_DYNO_ID: 'mock-heroku-dyno-id'
};

const { default: gatherAppInfo } = await import('../../../src/gather-app-info.ts');

describe('@dotcom-reliability-kit/app-info/src/gather-app-info', () => {
	it('exports a function', () => {
		assert.strictEqual(typeof gatherAppInfo, 'function');
	});

	describe('gatherAppInfo(options)', () => {
		let appInfo: AppInfo;

		beforeEach(() => {
			const env = { ...defaultEnv };
			appInfo = gatherAppInfo({ env, rootPath: `${fixtures}/empty` });
		});

		describe('.commitHash', () => {
			it('is set to `env.HEROKU_SLUG_COMMIT`', () => {
				assert.strictEqual(appInfo.commitHash, 'mock-heroku-commit-hash');
			});

			describe('when `env.HEROKU_SLUG_COMMIT` is not defined', () => {
				beforeEach(async () => {
					const env = { ...defaultEnv };
					delete env.HEROKU_SLUG_COMMIT;
					appInfo = gatherAppInfo({ env, rootPath: `${fixtures}/empty` });
				});

				it('is set to `env.GIT_COMMIT_LONG`', () => {
					assert.strictEqual(appInfo.commitHash, 'mock-git-commit-long');
				});
			});

			describe('when both `env.HEROKU_SLUG_COMMIT` and `env.GIT_COMMIT_LONG` are not defined', () => {
				beforeEach(async () => {
					const env = { ...defaultEnv };
					delete env.GIT_COMMIT_LONG;
					delete env.HEROKU_SLUG_COMMIT;
					appInfo = gatherAppInfo({ env, rootPath: `${fixtures}/empty` });
				});

				it('is set to `env.GIT_COMMIT`', () => {
					assert.strictEqual(appInfo.commitHash, 'mock-git-commit');
				});
			});

			describe('when no commit-related environment variable is defined', () => {
				beforeEach(async () => {
					const env = { ...defaultEnv };
					delete env.GIT_COMMIT;
					delete env.GIT_COMMIT_LONG;
					delete env.HEROKU_SLUG_COMMIT;
					appInfo = gatherAppInfo({ env, rootPath: `${fixtures}/empty` });
				});

				it('is set to null', () => {
					assert.strictEqual(appInfo.commitHash, null);
				});
			});
		});

		describe('.environment', () => {
			it('is set to `env.DEPLOYMENT_ENVIRONMENT`', () => {
				assert.strictEqual(appInfo.environment, 'mock-deployment-environment');
			});

			describe('when `env.DEPLOYMENT_ENVIRONMENT` is not defined', () => {
				beforeEach(async () => {
					const env = { ...defaultEnv };
					delete env.DEPLOYMENT_ENVIRONMENT;
					appInfo = gatherAppInfo({ env, rootPath: `${fixtures}/empty` });
				});

				it('is set to the value of `env.RELEASE_ENV`', () => {
					assert.strictEqual(appInfo.environment, 'mock-release-env');
				});
			});

			describe('when `env.RELEASE_ENV` is not defined', () => {
				beforeEach(async () => {
					const env = { ...defaultEnv };
					delete env.DEPLOYMENT_ENVIRONMENT;
					delete env.RELEASE_ENV;
					appInfo = gatherAppInfo({ env, rootPath: `${fixtures}/empty` });
				});

				it('is set to the value of `env.ENVIRONMENT`', () => {
					assert.strictEqual(appInfo.environment, 'mock-environment');
				});
			});

			describe('when `env.ENVIRONMENT` is not defined', () => {
				beforeEach(async () => {
					const env = { ...defaultEnv };
					delete env.DEPLOYMENT_ENVIRONMENT;
					delete env.RELEASE_ENV;
					delete env.ENVIRONMENT;
					appInfo = gatherAppInfo({ env, rootPath: `${fixtures}/empty` });
				});

				it('is set to the value of `env.NODE_ENV`', () => {
					assert.strictEqual(appInfo.environment, 'mock-node-env');
				});
			});

			describe('when none of the related environment variables are defined', () => {
				beforeEach(async () => {
					const env = { ...defaultEnv };
					delete env.DEPLOYMENT_ENVIRONMENT;
					delete env.RELEASE_ENV;
					delete env.ENVIRONMENT;
					delete env.NODE_ENV;
					appInfo = gatherAppInfo({ env, rootPath: `${fixtures}/empty` });
				});

				it('is set to "development"', () => {
					assert.strictEqual(appInfo.environment, 'development');
				});
			});
		});

		describe('.region', () => {
			it('is set to `env.REGION`', () => {
				assert.strictEqual(appInfo.region, 'mock-region');
			});

			describe('when `env.REGION` is not defined', () => {
				beforeEach(async () => {
					const env = { ...defaultEnv };
					delete env.REGION;
					appInfo = gatherAppInfo({ env, rootPath: `${fixtures}/empty` });
				});

				it('is set to `env.AWS_REGION`', () => {
					assert.strictEqual(appInfo.region, 'mock-aws-region');
				});
			});

			describe('when neither environment variable is defined', () => {
				beforeEach(async () => {
					const env = { ...defaultEnv };
					delete env.AWS_REGION;
					delete env.REGION;
					appInfo = gatherAppInfo({ env, rootPath: `${fixtures}/empty` });
				});

				it('is set to null', () => {
					assert.strictEqual(appInfo.region, null);
				});
			});
		});

		describe('.releaseDate', () => {
			it('is set to `env.HEROKU_RELEASE_CREATED_AT`', () => {
				assert.strictEqual(appInfo.releaseDate, 'mock-heroku-release-date');
			});

			describe('when `env.HEROKU_RELEASE_CREATED_AT` is not defined', () => {
				beforeEach(async () => {
					const env = { ...defaultEnv };
					delete env.HEROKU_RELEASE_CREATED_AT;
					appInfo = gatherAppInfo({ env, rootPath: `${fixtures}/empty` });
				});

				it('is set to null', () => {
					assert.strictEqual(appInfo.releaseDate, null);
				});
			});
		});

		describe('.releaseVersion', () => {
			it('is set to `env.HEROKU_RELEASE_VERSION`', () => {
				assert.strictEqual(appInfo.releaseVersion, 'mock-heroku-release-version');
			});

			describe('when `env.HEROKU_RELEASE_VERSION` is not defined', () => {
				beforeEach(async () => {
					const env = { ...defaultEnv };
					delete env.HEROKU_RELEASE_VERSION;
					appInfo = gatherAppInfo({ env, rootPath: `${fixtures}/empty` });
				});

				it('is set to `env.AWS_LAMBDA_FUNCTION_VERSION`', () => {
					assert.strictEqual(appInfo.releaseVersion, 'mock-aws-release-version');
				});
			});

			describe('when neither environment variable is defined but a package.json exists', () => {
				let env: typeof process.env;

				beforeEach(async () => {
					env = { ...defaultEnv };
					delete env.HEROKU_RELEASE_VERSION;
					delete env.AWS_LAMBDA_FUNCTION_VERSION;
					appInfo = gatherAppInfo({ env, rootPath: `${fixtures}/package` });
				});

				it('is set to the package.json version in the current working directory', () => {
					assert.strictEqual(appInfo.releaseVersion, 'mock-package-version');
				});

				describe('when the package.json has a non-string `version` property', () => {
					beforeEach(async () => {
						appInfo = gatherAppInfo({
							env,
							rootPath: `${fixtures}/non-string-version`
						});
					});

					it('is set to `null`', () => {
						assert.strictEqual(appInfo.releaseVersion, null);
					});
				});

				describe('when the package.json is not an object', () => {
					beforeEach(async () => {
						appInfo = gatherAppInfo({ env, rootPath: `${fixtures}/non-object` });
					});

					it('is set to `null`', () => {
						assert.strictEqual(appInfo.releaseVersion, null);
					});
				});
			});

			describe('when neither environment variable is defined and a package.json does not exist', () => {
				beforeEach(async () => {
					const env = { ...defaultEnv };
					delete env.HEROKU_RELEASE_VERSION;
					delete env.AWS_LAMBDA_FUNCTION_VERSION;
					appInfo = gatherAppInfo({ env, rootPath: `${fixtures}/empty` });
				});

				it('is set to `null`', () => {
					assert.strictEqual(appInfo.releaseVersion, null);
				});
			});
		});

		describe('.systemCode', () => {
			it('is set to `env.SYSTEM_CODE`', () => {
				assert.strictEqual(appInfo.systemCode, 'mock-system-code');
			});

			describe('when `env.SYSTEM_CODE` is not defined but a package.json exists', () => {
				let env: typeof process.env;

				beforeEach(async () => {
					env = { ...defaultEnv };
					delete env.SYSTEM_CODE;
					appInfo = gatherAppInfo({ env, rootPath: `${fixtures}/package` });
				});

				it('is set to the package.json name in the current working directory', () => {
					assert.strictEqual(appInfo.systemCode, 'mock-package-name');
				});

				describe('when the package.json `name` property begins with "ft-"', () => {
					beforeEach(async () => {
						appInfo = gatherAppInfo({ env, rootPath: `${fixtures}/ft-package` });
					});

					it('is set to the package.json name with the "ft-" removed', () => {
						assert.strictEqual(appInfo.systemCode, 'mock-package-name');
					});
				});

				describe('when the package.json has a non-string `name` property', () => {
					beforeEach(async () => {
						appInfo = gatherAppInfo({ env, rootPath: `${fixtures}/non-string-name` });
					});

					it('is set to `null`', () => {
						assert.strictEqual(appInfo.systemCode, null);
					});
				});

				describe('when the package.json is not an object', () => {
					beforeEach(async () => {
						appInfo = gatherAppInfo({ env, rootPath: `${fixtures}/non-object` });
					});

					it('is set to `null`', () => {
						assert.strictEqual(appInfo.systemCode, null);
					});
				});
			});

			describe('when `env.SYSTEM_CODE` is not defined and a package.json does not exist', () => {
				beforeEach(async () => {
					const env = { ...defaultEnv };
					delete env.SYSTEM_CODE;
					appInfo = gatherAppInfo({ env, rootPath: `${fixtures}/empty` });
				});

				it('is set to `null`', () => {
					assert.strictEqual(appInfo.systemCode, null);
				});
			});
		});

		describe('.processType', () => {
			it('is set to `env.AWS_LAMBDA_FUNCTION_NAME`', () => {
				assert.strictEqual(appInfo.processType, 'mock-lambda-function-name');
			});

			describe('when `env.DYNO` is defined and `env.AWS_LAMBDA_FUNCTION_NAME` is not', () => {
				beforeEach(async () => {
					const env = { ...defaultEnv };
					delete env.AWS_LAMBDA_FUNCTION_NAME;
					appInfo = gatherAppInfo({ env, rootPath: `${fixtures}/empty` });
				});

				it('is set to the part of `env.DYNO` before the dot', () => {
					assert.strictEqual(appInfo.processType, 'mock-heroku-process-type');
				});
			});

			describe('when neither `env.AWS_LAMBDA_FUNCTION_NAME` or `env.DYNO` are defined', () => {
				beforeEach(async () => {
					const env = { ...defaultEnv };
					delete env.DYNO;
					delete env.AWS_LAMBDA_FUNCTION_NAME;
					appInfo = gatherAppInfo({ env, rootPath: `${fixtures}/empty` });
				});

				it('is set to null', () => {
					assert.strictEqual(appInfo.processType, null);
				});
			});
		});

		describe('.cloudProvider', () => {
			let env: typeof process.env;

			beforeEach(async () => {
				env = { ...defaultEnv };
				delete env.AWS_LAMBDA_FUNCTION_NAME;
				delete env.HEROKU_RELEASE_CREATED_AT;
				delete env.HAKO_SERVICE_URL;
				appInfo = gatherAppInfo({ env, rootPath: `${fixtures}/empty` });
			});

			it('is set to null', () => {
				assert.strictEqual(appInfo.cloudProvider, null);
			});

			describe('when `env.AWS_LAMBDA_FUNCTION_NAME` is defined', () => {
				beforeEach(async () => {
					env.AWS_LAMBDA_FUNCTION_NAME = 'mock-lambda-function-name';
					appInfo = gatherAppInfo({ env, rootPath: `${fixtures}/empty` });
				});

				it('is set to "aws"', () => {
					assert.strictEqual(appInfo.cloudProvider, 'aws');
				});
			});

			describe('when `env.HAKO_SERVICE_URL` is defined', () => {
				beforeEach(async () => {
					env.HAKO_SERVICE_URL = 'mock-hako-service-url';
					appInfo = gatherAppInfo({ env, rootPath: `${fixtures}/empty` });
				});

				it('is set to "aws"', () => {
					assert.strictEqual(appInfo.cloudProvider, 'aws');
				});
			});

			describe('when `env.HEROKU_RELEASE_CREATED_AT` is defined', () => {
				beforeEach(async () => {
					env.HEROKU_RELEASE_CREATED_AT = 'mock-release-created-at';
					appInfo = gatherAppInfo({ env, rootPath: `${fixtures}/empty` });
				});

				it('is set to "heroku"', () => {
					assert.strictEqual(appInfo.cloudProvider, 'heroku');
				});
			});
		});

		describe('.herokuAppId', () => {
			it('returns HEROKU_APP_ID when env.HEROKU_APP_ID exists', () => {
				assert.strictEqual(appInfo.herokuAppId, 'mock-heroku-app-id');
			});

			it('returns null when env.HEROKU_APP_ID does not exist', async () => {
				const env = { ...defaultEnv };
				delete env.HEROKU_APP_ID;
				appInfo = gatherAppInfo({ env, rootPath: `${fixtures}/empty` });
				assert.strictEqual(appInfo.herokuAppId, null);
			});
		});

		describe('.herokuDynoId', () => {
			it('returns HEROKU_DYNO_ID when `env.HEROKU_DYNO_ID` exists', () => {
				assert.strictEqual(appInfo.herokuDynoId, 'mock-heroku-dyno-id');
			});
			it('returns null when `env.HEROKU_DYNO_ID` does not exist', async () => {
				const env = { ...defaultEnv };
				delete env.HEROKU_DYNO_ID;
				appInfo = gatherAppInfo({ env, rootPath: `${fixtures}/empty` });
				assert.strictEqual(appInfo.herokuDynoId, null);
			});
		});

		describe('.instanceId', () => {
			let appInfo: AppInfo;

			beforeEach(async () => {
				crypto.randomUUID.mock.resetCalls();
				const env = { ...defaultEnv };
				appInfo = gatherAppInfo({ env, rootPath: `${fixtures}/empty` });
			});

			it('is set to a random UUID', () => {
				assert.strictEqual(crypto.randomUUID.mock.callCount(), 1);
				assert.strictEqual(appInfo.instanceId, 'mock-generated-uuid');
			});
		});

		describe('.semanticConventions', () => {
			describe('.cloud', () => {
				describe('.provider', () => {
					it('is an alias of `cloudProvider`', () => {
						assert.strictEqual(
							appInfo.semanticConventions.cloud.provider,
							appInfo.cloudProvider
						);
					});
				});

				describe('.region', () => {
					it('is an alias of `region`', () => {
						assert.strictEqual(
							appInfo.semanticConventions.cloud.region,
							appInfo.region
						);
					});
				});
			});

			describe('.deployment', () => {
				describe('.environment', () => {
					it('is an alias of `environment`', () => {
						assert.strictEqual(
							appInfo.semanticConventions.deployment.environment,
							appInfo.environment
						);
					});
				});
			});

			describe('.service', () => {
				describe('.name', () => {
					it('is an alias of `systemCode`', () => {
						assert.strictEqual(
							appInfo.semanticConventions.service.name,
							appInfo.systemCode
						);
					});
				});

				describe('.version', () => {
					it('is an alias of `releaseVersion`', () => {
						assert.strictEqual(
							appInfo.semanticConventions.service.version,
							appInfo.releaseVersion
						);
					});
				});

				describe('.instance', () => {
					describe('.id', () => {
						it('is an alias of `instanceId`', () => {
							assert.strictEqual(
								appInfo.semanticConventions.service.instance.id,
								appInfo.instanceId
							);
						});
					});
				});
			});
		});
	});
});
