describe('@dotcom-reliability-kit/app-info', () => {
	let appInfo;

	beforeEach(() => {
		jest.spyOn(process, 'cwd').mockReturnValue('/mock-cwd');
		process.env.AWS_LAMBDA_FUNCTION_VERSION = 'mock-aws-release-version';
		process.env.AWS_LAMBDA_FUNCTION_NAME = 'mock-aws-process-type';
		process.env.AWS_REGION = 'mock-aws-region';
		process.env.GIT_COMMIT = 'mock-git-commit';
		process.env.GIT_COMMIT_LONG = 'mock-git-commit-long';
		process.env.HEROKU_RELEASE_CREATED_AT = 'mock-heroku-release-date';
		process.env.HEROKU_RELEASE_VERSION = 'mock-heroku-release-version';
		process.env.HEROKU_SLUG_COMMIT = 'mock-heroku-commit-hash';
		process.env.NODE_ENV = 'mock-environment';
		process.env.REGION = 'mock-region';
		process.env.SYSTEM_CODE = 'mock-system-code';
		process.env.DYNO = 'mock-heroku-process-type.1';
		process.env.HEROKU_APP_ID = 'mock-heroku-app-id';
		process.env.HEROKU_DYNO_ID = 'mock-heroku-dyno-id';
		appInfo = require('../../../lib');
	});

	describe('.default', () => {
		it('aliases the module exports', () => {
			expect(appInfo.default).toStrictEqual(appInfo);
		});
	});

	describe('.commitHash', () => {
		it('is set to `process.env.HEROKU_SLUG_COMMIT`', () => {
			expect(appInfo.commitHash).toBe('mock-heroku-commit-hash');
		});

		describe('when `process.env.HEROKU_SLUG_COMMIT` is not defined', () => {
			beforeEach(() => {
				jest.resetModules();
				delete process.env.HEROKU_SLUG_COMMIT;
				appInfo = require('../../../lib');
			});

			it('is set to `process.env.GIT_COMMIT_LONG`', () => {
				expect(appInfo.commitHash).toBe('mock-git-commit-long');
			});
		});

		describe('when both `process.env.HEROKU_SLUG_COMMIT` and `process.env.GIT_COMMIT_LONG` are not defined', () => {
			beforeEach(() => {
				jest.resetModules();
				delete process.env.GIT_COMMIT_LONG;
				delete process.env.HEROKU_SLUG_COMMIT;
				appInfo = require('../../../lib');
			});

			it('is set to `process.env.GIT_COMMIT`', () => {
				expect(appInfo.commitHash).toBe('mock-git-commit');
			});
		});

		describe('when no commit-related environment variable is defined', () => {
			beforeEach(() => {
				jest.resetModules();
				delete process.env.GIT_COMMIT;
				delete process.env.GIT_COMMIT_LONG;
				delete process.env.HEROKU_SLUG_COMMIT;
				appInfo = require('../../../lib');
			});

			it('is set to null', () => {
				expect(appInfo.commitHash).toBe(null);
			});
		});
	});

	describe('.environment', () => {
		it('is set to `process.env.NODE_ENV`', () => {
			expect(appInfo.environment).toBe('mock-environment');
		});

		describe('when `process.env.NODE_ENV` is not defined', () => {
			beforeEach(() => {
				jest.resetModules();
				delete process.env.NODE_ENV;
				appInfo = require('../../../lib');
			});

			it('is set to "development"', () => {
				expect(appInfo.environment).toBe('development');
			});
		});
	});

	describe('.region', () => {
		it('is set to `process.env.REGION`', () => {
			expect(appInfo.region).toBe('mock-region');
		});

		describe('when `process.env.REGION` is not defined', () => {
			beforeEach(() => {
				jest.resetModules();
				delete process.env.REGION;
				appInfo = require('../../../lib');
			});

			it('is set to `process.env.AWS_REGION`', () => {
				expect(appInfo.region).toBe('mock-aws-region');
			});
		});

		describe('when neither environment variable is defined', () => {
			beforeEach(() => {
				jest.resetModules();
				delete process.env.AWS_REGION;
				delete process.env.REGION;
				appInfo = require('../../../lib');
			});

			it('is set to null', () => {
				expect(appInfo.region).toBe(null);
			});
		});
	});

	describe('.releaseDate', () => {
		it('is set to `process.env.HEROKU_RELEASE_CREATED_AT`', () => {
			expect(appInfo.releaseDate).toBe('mock-heroku-release-date');
		});

		describe('when `process.env.HEROKU_RELEASE_CREATED_AT` is not defined', () => {
			beforeEach(() => {
				jest.resetModules();
				delete process.env.HEROKU_RELEASE_CREATED_AT;
				appInfo = require('../../../lib');
			});

			it('is set to null', () => {
				expect(appInfo.releaseDate).toBe(null);
			});
		});
	});

	describe('.releaseVersion', () => {
		it('is set to `process.env.HEROKU_RELEASE_VERSION`', () => {
			expect(appInfo.releaseVersion).toBe('mock-heroku-release-version');
		});

		describe('when `process.env.HEROKU_RELEASE_VERSION` is not defined', () => {
			beforeEach(() => {
				jest.resetModules();
				delete process.env.HEROKU_RELEASE_VERSION;
				appInfo = require('../../../lib');
			});

			it('is set to `process.env.AWS_LAMBDA_FUNCTION_VERSION`', () => {
				expect(appInfo.releaseVersion).toBe('mock-aws-release-version');
			});
		});

		describe('when neither environment variable is defined', () => {
			beforeEach(() => {
				jest.resetModules();
				delete process.env.AWS_LAMBDA_FUNCTION_VERSION;
				delete process.env.HEROKU_RELEASE_VERSION;
				appInfo = require('../../../lib');
			});

			it('is set to null', () => {
				expect(appInfo.releaseVersion).toBe(null);
			});
		});
	});

	describe('.systemCode', () => {
		it('is set to `process.env.SYSTEM_CODE`', () => {
			expect(appInfo.systemCode).toBe('mock-system-code');
		});

		describe('when `process.env.SYSTEM_CODE` is not defined but a package.json exists', () => {
			beforeEach(() => {
				jest.resetModules();
				jest.mock(
					'/mock-cwd/package.json',
					() => ({ name: 'mock-package-name' }),
					{ virtual: true }
				);
				delete process.env.SYSTEM_CODE;
				appInfo = require('../../../lib');
			});

			it('is set to the package.json name in the current working directory', () => {
				expect(appInfo.systemCode).toBe('mock-package-name');
			});

			describe('when the package.json `name` property begins with "ft-"', () => {
				beforeEach(() => {
					jest.resetModules();
					jest.mock(
						'/mock-cwd/package.json',
						() => ({ name: 'ft-mock-package-name' }),
						{ virtual: true }
					);
					appInfo = require('../../../lib');
				});

				it('is set to the package.json name with the "ft-" removed', () => {
					expect(appInfo.systemCode).toBe('mock-package-name');
				});
			});

			describe('when the package.json has a non-string `name` property', () => {
				beforeEach(() => {
					jest.resetModules();
					jest.mock('/mock-cwd/package.json', () => ({ name: 123 }), {
						virtual: true
					});
					appInfo = require('../../../lib');
				});

				it('is set to `null`', () => {
					expect(appInfo.systemCode).toBe(null);
				});
			});

			describe('when the package.json is not an object', () => {
				beforeEach(() => {
					jest.resetModules();
					jest.mock('/mock-cwd/package.json', () => null, { virtual: true });
					appInfo = require('../../../lib');
				});

				it('is set to `null`', () => {
					expect(appInfo.systemCode).toBe(null);
				});
			});
		});

		describe('when `process.env.SYSTEM_CODE` is not defined and a package.json does not exist', () => {
			beforeEach(() => {
				jest.unmock('/mock-cwd/package.json');
				jest.resetModules();
				delete process.env.SYSTEM_CODE;
				appInfo = require('../../../lib');
			});

			it('is set to `null`', () => {
				expect(appInfo.systemCode).toBe(null);
			});
		});
	});

	describe('.processType', () => {
		it('is set to `process.env.AWS_LAMBDA_FUNCTION_NAME`', () => {
			expect(appInfo.processType).toBe('mock-aws-process-type');
		});

		describe('when `process.env.DYNO` is defined and `process.env.AWS_LAMBDA_FUNCTION_NAME` is not', () => {
			beforeEach(() => {
				jest.resetModules();
				delete process.env.AWS_LAMBDA_FUNCTION_NAME;
				appInfo = require('../../../lib');
			});

			it('is set to the part of `process.env.DYNO` before the dot', () => {
				expect(appInfo.processType).toBe('mock-heroku-process-type');
			});
		});

		describe('when neither `process.env.AWS_LAMBDA_FUNCTION_NAME` or `process.env.DYNO` are defined', () => {
			beforeEach(() => {
				jest.resetModules();
				delete process.env.DYNO;
				delete process.env.AWS_LAMBDA_FUNCTION_NAME;
				appInfo = require('../../../lib');
			});

			it('is set to null', () => {
				expect(appInfo.processType).toBe(null);
			});
		});
	});

	describe('.cloudProvider', () => {
		it('is set to `aws` if processType is set to `process.env.AWS_LAMBDA_FUNCTION_NAME`', () => {
			if (appInfo.processType === process.env.AWS_LAMBDA_FUNCTION_NAME) {
				expect(appInfo.cloudProvider).toBe('aws');
			}
		});

		it('is set to `heroku` if `process.env.HEROKU_RELEASE_CREATED_AT` is set to true', () => {
			if (process.env.HEROKU_RELEASE_CREATED_AT) {
				expect(appInfo.cloudProvider).toBe('heroku');
			}
		});

		describe('when neither `process.env.AWS_LAMBDA_FUNCTION_NAME` or `process.env.HEROKU_RELEASE_CREATED_AT` are defined', () => {
			beforeEach(() => {
				jest.resetModules();
				delete process.env.HEROKU_RELEASE_CREATED_AT;
				delete process.env.AWS_LAMBDA_FUNCTION_NAME;
				appInfo = require('../../../lib');
			});

			it('is set to null', () => {
				expect(appInfo.cloudProvider).toBe(null);
			});
		});
	});
	describe('.herokuAppId', () => {
		it('returns HEROKU_APP_ID when process.env.HEROKU_APP_ID exists', () => {
			expect(appInfo.herokuAppId).toBe('mock-heroku-app-id');
		});

		it('returns null when process.env.HEROKU_APP_ID does not exist', () => {
			jest.resetModules();
			delete process.env.HEROKU_APP_ID;
			appInfo = require('../../../lib');
			expect(appInfo.herokuAppId).toBe(null);
		});
	});
	describe('.herokuDynoId', () => {
		it('returns HEROKU_DYNO_ID when `process.env.HEROKU_DYNO_ID` exists', () => {
			expect(appInfo.herokuDynoId).toBe('mock-heroku-dyno-id');
		});
		it('returns null when `process.env.HEROKU_DYNO_ID` does not exist', () => {
			jest.resetModules();
			delete process.env.HEROKU_DYNO_ID;
			appInfo = require('../../../lib');
			expect(appInfo.herokuDynoId).toBe(null);
		});
	});
});
