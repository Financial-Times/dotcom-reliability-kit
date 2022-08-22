describe('@dotcom-reliability-kit/app-info', () => {
	let appInfo;

	beforeEach(() => {
		jest.spyOn(process, 'cwd').mockReturnValue('/mock-cwd');
		process.env.HEROKU_RELEASE_CREATED_AT = 'mock-release-date';
		process.env.HEROKU_RELEASE_VERSION = 'mock-release-version';
		process.env.HEROKU_SLUG_COMMIT = 'mock-commit-hash';
		process.env.NODE_ENV = 'mock-environment';
		process.env.REGION = 'mock-region';
		process.env.SYSTEM_CODE = 'mock-system-code';
		appInfo = require('../../../lib');
	});

	describe('.commitHash', () => {
		it('is set to `process.env.HEROKU_SLUG_COMMIT`', () => {
			expect(appInfo.commitHash).toBe('mock-commit-hash');
		});

		describe('when `process.env.HEROKU_SLUG_COMMIT` is not defined', () => {
			beforeEach(() => {
				jest.resetModules();
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

			it('is set to null', () => {
				expect(appInfo.region).toBe(null);
			});
		});
	});

	describe('.releaseDate', () => {
		it('is set to `process.env.HEROKU_RELEASE_CREATED_AT`', () => {
			expect(appInfo.releaseDate).toBe('mock-release-date');
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
			expect(appInfo.releaseVersion).toBe('mock-release-version');
		});

		describe('when `process.env.HEROKU_RELEASE_VERSION` is not defined', () => {
			beforeEach(() => {
				jest.resetModules();
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
});
