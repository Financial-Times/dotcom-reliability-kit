const { afterEach, beforeEach, describe, it, mock } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

const crypto = { randomUUID: mock.fn(() => 'mock-generated-uuid') };
mock.module('node:crypto', { defaultExport: crypto, namedExports: crypto });
const fixtures = path.resolve(__dirname, '..', 'fixtures');

describe('@dotcom-reliability-kit/app-info', () => {
	let appInfo;

	beforeEach(() => {
		mock.method(process, 'cwd', () => `${fixtures}/empty`);
		process.env.AWS_LAMBDA_FUNCTION_VERSION = 'mock-aws-release-version';
		process.env.AWS_LAMBDA_FUNCTION_NAME = 'mock-lambda-function-name';
		process.env.AWS_REGION = 'mock-aws-region';
		process.env.GIT_COMMIT = 'mock-git-commit';
		process.env.GIT_COMMIT_LONG = 'mock-git-commit-long';
		process.env.HEROKU_RELEASE_CREATED_AT = 'mock-heroku-release-date';
		process.env.HEROKU_RELEASE_VERSION = 'mock-heroku-release-version';
		process.env.HEROKU_SLUG_COMMIT = 'mock-heroku-commit-hash';
		process.env.DEPLOYMENT_ENVIRONMENT = 'mock-deployment-environment';
		process.env.RELEASE_ENV = 'mock-release-env';
		process.env.ENVIRONMENT = 'mock-environment';
		process.env.NODE_ENV = 'mock-node-env';
		process.env.REGION = 'mock-region';
		process.env.SYSTEM_CODE = 'mock-system-code';
		process.env.DYNO = 'mock-heroku-process-type.1';
		process.env.HEROKU_APP_ID = 'mock-heroku-app-id';
		process.env.HEROKU_DYNO_ID = 'mock-heroku-dyno-id';
		appInfo = require('@dotcom-reliability-kit/app-info');
	});

	afterEach(() => {
		process.cwd.mock.mockImplementation(() => `${fixtures}/empty`);
	});

	describe('.default', () => {
		it('aliases the module exports', () => {
			assert.strictEqual(appInfo.default, appInfo);
		});
	});

	describe('.commitHash', () => {
		it('is set to `process.env.HEROKU_SLUG_COMMIT`', () => {
			assert.strictEqual(appInfo.commitHash, 'mock-heroku-commit-hash');
		});

		describe('when `process.env.HEROKU_SLUG_COMMIT` is not defined', () => {
			beforeEach(() => {
				delete process.env.HEROKU_SLUG_COMMIT;
				delete require.cache[require.resolve('@dotcom-reliability-kit/app-info')];
				appInfo = require('@dotcom-reliability-kit/app-info');
			});

			it('is set to `process.env.GIT_COMMIT_LONG`', () => {
				assert.strictEqual(appInfo.commitHash, 'mock-git-commit-long');
			});
		});

		describe('when both `process.env.HEROKU_SLUG_COMMIT` and `process.env.GIT_COMMIT_LONG` are not defined', () => {
			beforeEach(() => {
				delete process.env.GIT_COMMIT_LONG;
				delete process.env.HEROKU_SLUG_COMMIT;
				delete require.cache[require.resolve('@dotcom-reliability-kit/app-info')];
				appInfo = require('@dotcom-reliability-kit/app-info');
			});

			it('is set to `process.env.GIT_COMMIT`', () => {
				assert.strictEqual(appInfo.commitHash, 'mock-git-commit');
			});
		});

		describe('when no commit-related environment variable is defined', () => {
			beforeEach(() => {
				delete process.env.GIT_COMMIT;
				delete process.env.GIT_COMMIT_LONG;
				delete process.env.HEROKU_SLUG_COMMIT;
				delete require.cache[require.resolve('@dotcom-reliability-kit/app-info')];
				appInfo = require('@dotcom-reliability-kit/app-info');
			});

			it('is set to null', () => {
				assert.strictEqual(appInfo.commitHash, null);
			});
		});
	});

	describe('.environment', () => {
		it('is set to `process.env.DEPLOYMENT_ENVIRONMENT`', () => {
			assert.strictEqual(appInfo.environment, 'mock-deployment-environment');
		});

		describe('when `process.env.DEPLOYMENT_ENVIRONMENT` is not defined', () => {
			beforeEach(() => {
				delete process.env.DEPLOYMENT_ENVIRONMENT;
				delete require.cache[require.resolve('@dotcom-reliability-kit/app-info')];
				appInfo = require('@dotcom-reliability-kit/app-info');
			});

			it('is set to the value of `process.env.RELEASE_ENV`', () => {
				assert.strictEqual(appInfo.environment, 'mock-release-env');
			});
		});

		describe('when `process.env.RELEASE_ENV` is not defined', () => {
			beforeEach(() => {
				delete process.env.DEPLOYMENT_ENVIRONMENT;
				delete process.env.RELEASE_ENV;
				delete require.cache[require.resolve('@dotcom-reliability-kit/app-info')];
				appInfo = require('@dotcom-reliability-kit/app-info');
			});

			it('is set to the value of `process.env.ENVIRONMENT`', () => {
				assert.strictEqual(appInfo.environment, 'mock-environment');
			});
		});

		describe('when `process.env.ENVIRONMENT` is not defined', () => {
			beforeEach(() => {
				delete process.env.DEPLOYMENT_ENVIRONMENT;
				delete process.env.RELEASE_ENV;
				delete process.env.ENVIRONMENT;
				delete require.cache[require.resolve('@dotcom-reliability-kit/app-info')];
				appInfo = require('@dotcom-reliability-kit/app-info');
			});

			it('is set to the value of `process.env.NODE_ENV`', () => {
				assert.strictEqual(appInfo.environment, 'mock-node-env');
			});
		});

		describe('when none of the related environment variables are defined', () => {
			beforeEach(() => {
				delete process.env.DEPLOYMENT_ENVIRONMENT;
				delete process.env.RELEASE_ENV;
				delete process.env.ENVIRONMENT;
				delete process.env.NODE_ENV;
				delete require.cache[require.resolve('@dotcom-reliability-kit/app-info')];
				appInfo = require('@dotcom-reliability-kit/app-info');
			});

			it('is set to "development"', () => {
				assert.strictEqual(appInfo.environment, 'development');
			});
		});
	});

	describe('.region', () => {
		it('is set to `process.env.REGION`', () => {
			assert.strictEqual(appInfo.region, 'mock-region');
		});

		describe('when `process.env.REGION` is not defined', () => {
			beforeEach(() => {
				delete process.env.REGION;
				delete require.cache[require.resolve('@dotcom-reliability-kit/app-info')];
				appInfo = require('@dotcom-reliability-kit/app-info');
			});

			it('is set to `process.env.AWS_REGION`', () => {
				assert.strictEqual(appInfo.region, 'mock-aws-region');
			});
		});

		describe('when neither environment variable is defined', () => {
			beforeEach(() => {
				delete process.env.AWS_REGION;
				delete process.env.REGION;
				delete require.cache[require.resolve('@dotcom-reliability-kit/app-info')];
				appInfo = require('@dotcom-reliability-kit/app-info');
			});

			it('is set to null', () => {
				assert.strictEqual(appInfo.region, null);
			});
		});
	});

	describe('.releaseDate', () => {
		it('is set to `process.env.HEROKU_RELEASE_CREATED_AT`', () => {
			assert.strictEqual(appInfo.releaseDate, 'mock-heroku-release-date');
		});

		describe('when `process.env.HEROKU_RELEASE_CREATED_AT` is not defined', () => {
			beforeEach(() => {
				delete process.env.HEROKU_RELEASE_CREATED_AT;
				delete require.cache[require.resolve('@dotcom-reliability-kit/app-info')];
				appInfo = require('@dotcom-reliability-kit/app-info');
			});

			it('is set to null', () => {
				assert.strictEqual(appInfo.releaseDate, null);
			});
		});
	});

	describe('.releaseVersion', () => {
		it('is set to `process.env.HEROKU_RELEASE_VERSION`', () => {
			assert.strictEqual(appInfo.releaseVersion, 'mock-heroku-release-version');
		});

		describe('when `process.env.HEROKU_RELEASE_VERSION` is not defined', () => {
			beforeEach(() => {
				delete process.env.HEROKU_RELEASE_VERSION;
				delete require.cache[require.resolve('@dotcom-reliability-kit/app-info')];
				appInfo = require('@dotcom-reliability-kit/app-info');
			});

			it('is set to `process.env.AWS_LAMBDA_FUNCTION_VERSION`', () => {
				assert.strictEqual(appInfo.releaseVersion, 'mock-aws-release-version');
			});
		});

		describe('when neither environment variable is defined but a package.json exists', () => {
			beforeEach(() => {
				process.cwd.mock.mockImplementation(() => `${fixtures}/package`);
				delete process.env.HEROKU_RELEASE_VERSION;
				delete process.env.AWS_LAMBDA_FUNCTION_VERSION;
				delete require.cache[require.resolve('@dotcom-reliability-kit/app-info')];
				appInfo = require('@dotcom-reliability-kit/app-info');
			});

			it('is set to the package.json version in the current working directory', () => {
				assert.strictEqual(appInfo.releaseVersion, 'mock-package-version');
			});

			describe('when the package.json has a non-string `version` property', () => {
				beforeEach(() => {
					process.cwd.mock.mockImplementation(() => `${fixtures}/non-string-version`);
					delete require.cache[require.resolve('@dotcom-reliability-kit/app-info')];
					appInfo = require('@dotcom-reliability-kit/app-info');
				});

				it('is set to `null`', () => {
					assert.strictEqual(appInfo.releaseVersion, null);
				});
			});

			describe('when the package.json is not an object', () => {
				beforeEach(() => {
					process.cwd.mock.mockImplementation(() => `${fixtures}/non-object`);
					delete require.cache[require.resolve('@dotcom-reliability-kit/app-info')];
					appInfo = require('@dotcom-reliability-kit/app-info');
				});

				it('is set to `null`', () => {
					assert.strictEqual(appInfo.releaseVersion, null);
				});
			});
		});

		describe('when neither environment variable is defined and a package.json does not exist', () => {
			beforeEach(() => {
				process.cwd.mock.mockImplementation(() => `${fixtures}/empty`);
				delete process.env.HEROKU_RELEASE_VERSION;
				delete process.env.AWS_LAMBDA_FUNCTION_VERSION;
				delete require.cache[require.resolve('@dotcom-reliability-kit/app-info')];
				appInfo = require('@dotcom-reliability-kit/app-info');
			});

			it('is set to `null`', () => {
				assert.strictEqual(appInfo.releaseVersion, null);
			});
		});
	});

	describe('.systemCode', () => {
		it('is set to `process.env.SYSTEM_CODE`', () => {
			assert.strictEqual(appInfo.systemCode, 'mock-system-code');
		});

		describe('when `process.env.SYSTEM_CODE` is not defined but a package.json exists', () => {
			beforeEach(() => {
				process.cwd.mock.mockImplementation(() => `${fixtures}/package`);
				delete process.env.SYSTEM_CODE;
				delete require.cache[require.resolve('@dotcom-reliability-kit/app-info')];
				appInfo = require('@dotcom-reliability-kit/app-info');
			});

			it('is set to the package.json name in the current working directory', () => {
				assert.strictEqual(appInfo.systemCode, 'mock-package-name');
			});

			describe('when the package.json `name` property begins with "ft-"', () => {
				beforeEach(() => {
					process.cwd.mock.mockImplementation(() => `${fixtures}/ft-package`);
					delete require.cache[require.resolve('@dotcom-reliability-kit/app-info')];
					appInfo = require('@dotcom-reliability-kit/app-info');
				});

				it('is set to the package.json name with the "ft-" removed', () => {
					assert.strictEqual(appInfo.systemCode, 'mock-package-name');
				});
			});

			describe('when the package.json has a non-string `name` property', () => {
				beforeEach(() => {
					process.cwd.mock.mockImplementation(() => `${fixtures}/non-string-name`);
					delete require.cache[require.resolve('@dotcom-reliability-kit/app-info')];
					appInfo = require('@dotcom-reliability-kit/app-info');
				});

				it('is set to `null`', () => {
					assert.strictEqual(appInfo.systemCode, null);
				});
			});

			describe('when the package.json is not an object', () => {
				beforeEach(() => {
					process.cwd.mock.mockImplementation(() => `${fixtures}/non-object`);
					delete require.cache[require.resolve('@dotcom-reliability-kit/app-info')];
					appInfo = require('@dotcom-reliability-kit/app-info');
				});

				it('is set to `null`', () => {
					assert.strictEqual(appInfo.systemCode, null);
				});
			});
		});

		describe('when `process.env.SYSTEM_CODE` is not defined and a package.json does not exist', () => {
			beforeEach(() => {
				process.cwd.mock.mockImplementation(() => `${fixtures}/empty`);
				delete process.env.SYSTEM_CODE;
				delete require.cache[require.resolve('@dotcom-reliability-kit/app-info')];
				appInfo = require('@dotcom-reliability-kit/app-info');
			});

			it('is set to `null`', () => {
				assert.strictEqual(appInfo.systemCode, null);
			});
		});
	});

	describe('.processType', () => {
		it('is set to `process.env.AWS_LAMBDA_FUNCTION_NAME`', () => {
			assert.strictEqual(appInfo.processType, 'mock-lambda-function-name');
		});

		describe('when `process.env.DYNO` is defined and `process.env.AWS_LAMBDA_FUNCTION_NAME` is not', () => {
			beforeEach(() => {
				delete process.env.AWS_LAMBDA_FUNCTION_NAME;
				delete require.cache[require.resolve('@dotcom-reliability-kit/app-info')];
				appInfo = require('@dotcom-reliability-kit/app-info');
			});

			it('is set to the part of `process.env.DYNO` before the dot', () => {
				assert.strictEqual(appInfo.processType, 'mock-heroku-process-type');
			});
		});

		describe('when neither `process.env.AWS_LAMBDA_FUNCTION_NAME` or `process.env.DYNO` are defined', () => {
			beforeEach(() => {
				delete process.env.DYNO;
				delete process.env.AWS_LAMBDA_FUNCTION_NAME;
				delete require.cache[require.resolve('@dotcom-reliability-kit/app-info')];
				appInfo = require('@dotcom-reliability-kit/app-info');
			});

			it('is set to null', () => {
				assert.strictEqual(appInfo.processType, null);
			});
		});
	});

	describe('.cloudProvider', () => {
		beforeEach(() => {
			delete process.env.AWS_LAMBDA_FUNCTION_NAME;
			delete process.env.HEROKU_RELEASE_CREATED_AT;
			delete process.env.HAKO_SERVICE_URL;
			delete require.cache[require.resolve('@dotcom-reliability-kit/app-info')];
			appInfo = require('@dotcom-reliability-kit/app-info');
		});

		it('is set to null', () => {
			assert.strictEqual(appInfo.cloudProvider, null);
		});

		describe('when `process.env.AWS_LAMBDA_FUNCTION_NAME` is defined', () => {
			beforeEach(() => {
				process.env.AWS_LAMBDA_FUNCTION_NAME = 'mock-lambda-function-name';
				delete require.cache[require.resolve('@dotcom-reliability-kit/app-info')];
				appInfo = require('@dotcom-reliability-kit/app-info');
			});

			it('is set to "aws"', () => {
				assert.strictEqual(appInfo.cloudProvider, 'aws');
			});
		});

		describe('when `process.env.HAKO_SERVICE_URL` is defined', () => {
			beforeEach(() => {
				process.env.HAKO_SERVICE_URL = 'mock-hako-service-url';
				delete require.cache[require.resolve('@dotcom-reliability-kit/app-info')];
				appInfo = require('@dotcom-reliability-kit/app-info');
			});

			it('is set to "aws"', () => {
				assert.strictEqual(appInfo.cloudProvider, 'aws');
			});
		});

		describe('when `process.env.HEROKU_RELEASE_CREATED_AT` is defined', () => {
			beforeEach(() => {
				process.env.HEROKU_RELEASE_CREATED_AT = 'mock-release-created-at';
				delete require.cache[require.resolve('@dotcom-reliability-kit/app-info')];
				appInfo = require('@dotcom-reliability-kit/app-info');
			});

			it('is set to "heroku"', () => {
				assert.strictEqual(appInfo.cloudProvider, 'heroku');
			});
		});
	});

	describe('.herokuAppId', () => {
		it('returns HEROKU_APP_ID when process.env.HEROKU_APP_ID exists', () => {
			assert.strictEqual(appInfo.herokuAppId, 'mock-heroku-app-id');
		});

		it('returns null when process.env.HEROKU_APP_ID does not exist', () => {
			delete process.env.HEROKU_APP_ID;
			delete require.cache[require.resolve('@dotcom-reliability-kit/app-info')];
			appInfo = require('@dotcom-reliability-kit/app-info');
			assert.strictEqual(appInfo.herokuAppId, null);
		});
	});

	describe('.herokuDynoId', () => {
		it('returns HEROKU_DYNO_ID when `process.env.HEROKU_DYNO_ID` exists', () => {
			assert.strictEqual(appInfo.herokuDynoId, 'mock-heroku-dyno-id');
		});
		it('returns null when `process.env.HEROKU_DYNO_ID` does not exist', () => {
			delete process.env.HEROKU_DYNO_ID;
			delete require.cache[require.resolve('@dotcom-reliability-kit/app-info')];
			appInfo = require('@dotcom-reliability-kit/app-info');
			assert.strictEqual(appInfo.herokuDynoId, null);
		});
	});

	describe('.instanceId', () => {
		let appInfo;

		beforeEach(() => {
			crypto.randomUUID.mock.resetCalls();
			delete require.cache[require.resolve('@dotcom-reliability-kit/app-info')];
			appInfo = require('@dotcom-reliability-kit/app-info');
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
					assert.strictEqual(appInfo.semanticConventions.cloud.region, appInfo.region);
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
