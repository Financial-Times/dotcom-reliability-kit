const { afterEach, beforeEach, describe, it, mock } = require('node:test');
const assert = require('node:assert/strict');

const logger = {
	error: mock.fn(),
	fatal: mock.fn(),
	warn: mock.fn()
};
mock.module('@dotcom-reliability-kit/logger', { defaultExport: logger });

const serializeError = mock.fn(() => ({
	name: 'MockError',
	message: 'mock error'
}));
mock.module('@dotcom-reliability-kit/serialize-error', {
	// NOTE: this is temporary while we're importing ESM into CommonJS.
	//       Should be switched back when we migrate log-error to ESM.
	namedExports: { default: serializeError }
});

const serializeRequest = mock.fn(() => 'mock-serialized-request');
mock.module('@dotcom-reliability-kit/serialize-request', {
	// NOTE: this is temporary while we're importing ESM into CommonJS.
	//       Should be switched back when we migrate log-error to ESM.
	namedExports: { default: serializeRequest }
});

const appInfo = {};
mock.module('@dotcom-reliability-kit/app-info', { defaultExport: appInfo });

const logError = require('@dotcom-reliability-kit/log-error');
const { logHandledError, logRecoverableError, logUnhandledError } = logError;

describe('@dotcom-reliability-kit/log-error', () => {
	beforeEach(() => {
		appInfo.commitHash = 'mock-commit-hash';
		appInfo.region = 'mock-region';
		appInfo.releaseDate = 'mock-release-date';
		appInfo.systemCode = 'mock-system-code';
		appInfo.processType = 'mock-process-type';
	});

	afterEach(() => {
		serializeError.mock.resetCalls();
		serializeRequest.mock.resetCalls();
		logger.error.mock.resetCalls();
		logger.fatal.mock.resetCalls();
		logger.warn.mock.resetCalls();
	});

	describe('.default', () => {
		it('aliases the module exports', () => {
			assert.strictEqual(logError.default, logError);
		});
	});

	describe('logHandledError(options)', () => {
		let error;
		let request;

		beforeEach(() => {
			error = new Error('mock error');
			request = { isMockRequest: true };

			logHandledError({ error, request });
		});

		it('serializes the error', () => {
			assert.strictEqual(serializeError.mock.callCount(), 1);
			assert.deepStrictEqual(serializeError.mock.calls[0].arguments, [error]);
		});

		it('serializes the request', () => {
			assert.strictEqual(serializeRequest.mock.callCount(), 1);
			assert.deepStrictEqual(serializeRequest.mock.calls[0].arguments, [
				request,
				{ includeHeaders: undefined }
			]);
		});

		it('logs the serialized error, request, and app details', () => {
			assert.strictEqual(logger.error.mock.callCount(), 1);
			assert.deepStrictEqual(logger.error.mock.calls[0].arguments, [
				{
					event: 'HANDLED_ERROR',
					message: 'MockError: mock error',
					error: {
						name: 'MockError',
						message: 'mock error'
					},
					request: 'mock-serialized-request',
					app: {
						commit: 'mock-commit-hash',
						name: 'mock-system-code',
						nodeVersion: process.versions.node,
						region: 'mock-region',
						releaseDate: 'mock-release-date',
						processType: 'mock-process-type'
					}
				}
			]);
		});

		describe('when a system code is not defined', () => {
			beforeEach(() => {
				serializeError.mock.resetCalls();
				serializeRequest.mock.resetCalls();
				logger.error.mock.resetCalls();
				appInfo.systemCode = null;
				logHandledError({ error, request });
			});

			it('serializes the error', () => {
				assert.strictEqual(serializeError.mock.callCount(), 1);
				assert.deepStrictEqual(serializeError.mock.calls[0].arguments, [error]);
			});

			it('serializes the request', () => {
				assert.strictEqual(serializeRequest.mock.callCount(), 1);
				assert.deepStrictEqual(serializeRequest.mock.calls[0].arguments, [
					request,
					{ includeHeaders: undefined }
				]);
			});

			it('logs without an app name', () => {
				assert.strictEqual(logger.error.mock.callCount(), 1);
				assert.deepStrictEqual(logger.error.mock.calls[0].arguments, [
					{
						event: 'HANDLED_ERROR',
						message: 'MockError: mock error',
						error: {
							name: 'MockError',
							message: 'mock error'
						},
						request: 'mock-serialized-request',
						app: {
							commit: 'mock-commit-hash',
							name: null,
							nodeVersion: process.versions.node,
							region: 'mock-region',
							releaseDate: 'mock-release-date',
							processType: 'mock-process-type'
						}
					}
				]);
			});
		});

		describe('when the includeHeaders option is set', () => {
			beforeEach(() => {
				serializeError.mock.resetCalls();
				serializeRequest.mock.resetCalls();
				logger.error.mock.resetCalls();
				logHandledError({
					error,
					request,
					includeHeaders: ['header-1', 'header-2']
				});
			});

			it('serializes the error', () => {
				assert.strictEqual(serializeError.mock.callCount(), 1);
				assert.deepStrictEqual(serializeError.mock.calls[0].arguments, [error]);
			});

			it('serializes the request with the configured headers', () => {
				assert.strictEqual(serializeRequest.mock.callCount(), 1);
				assert.deepStrictEqual(serializeRequest.mock.calls[0].arguments, [
					request,
					{ includeHeaders: ['header-1', 'header-2'] }
				]);
			});

			it('logs the serialized error, request, and app details', () => {
				assert.strictEqual(logger.error.mock.callCount(), 1);
				assert.deepStrictEqual(logger.error.mock.calls[0].arguments, [
					{
						event: 'HANDLED_ERROR',
						message: 'MockError: mock error',
						error: {
							name: 'MockError',
							message: 'mock error'
						},
						request: 'mock-serialized-request',
						app: {
							commit: 'mock-commit-hash',
							name: 'mock-system-code',
							nodeVersion: process.versions.node,
							region: 'mock-region',
							releaseDate: 'mock-release-date',
							processType: 'mock-process-type'
						}
					}
				]);
			});
		});

		describe('when the request option is not set', () => {
			beforeEach(() => {
				serializeError.mock.resetCalls();
				serializeRequest.mock.resetCalls();
				logger.error.mock.resetCalls();
				logHandledError({ error });
			});

			it('serializes the error', () => {
				assert.strictEqual(serializeError.mock.callCount(), 1);
				assert.deepStrictEqual(serializeError.mock.calls[0].arguments, [error]);
			});

			it('does not serialize the request', () => {
				assert.strictEqual(serializeRequest.mock.callCount(), 0);
			});

			it('logs the serialized error and app details', () => {
				assert.strictEqual(logger.error.mock.callCount(), 1);
				assert.deepStrictEqual(logger.error.mock.calls[0].arguments, [
					{
						event: 'HANDLED_ERROR',
						message: 'MockError: mock error',
						error: {
							name: 'MockError',
							message: 'mock error'
						},
						app: {
							commit: 'mock-commit-hash',
							name: 'mock-system-code',
							nodeVersion: process.versions.node,
							region: 'mock-region',
							releaseDate: 'mock-release-date',
							processType: 'mock-process-type'
						}
					}
				]);
			});
		});

		describe('when the serialized error does not have a name', () => {
			beforeEach(() => {
				serializeError.mock.resetCalls();
				serializeRequest.mock.resetCalls();
				logger.error.mock.resetCalls();
				serializeError.mock.mockImplementationOnce(() => ({ message: 'mock error' }));
				logHandledError({ error, request });
			});

			it('defaults the message to use "Error"', () => {
				assert.strictEqual(logger.error.mock.callCount(), 1);
				assert.deepStrictEqual(logger.error.mock.calls[0].arguments, [
					{
						event: 'HANDLED_ERROR',
						message: 'Error: mock error',
						error: {
							message: 'mock error'
						},
						request: 'mock-serialized-request',
						app: {
							commit: 'mock-commit-hash',
							name: 'mock-system-code',
							nodeVersion: process.versions.node,
							region: 'mock-region',
							releaseDate: 'mock-release-date',
							processType: 'mock-process-type'
						}
					}
				]);
			});
		});

		describe('when the serialized error does not have a message', () => {
			beforeEach(() => {
				serializeError.mock.resetCalls();
				serializeRequest.mock.resetCalls();
				logger.error.mock.resetCalls();
				serializeError.mock.mockImplementationOnce(() => ({ name: 'MockError' }));
				logHandledError({ error, request });
			});

			it('defaults the message to only use the name', () => {
				assert.strictEqual(logger.error.mock.callCount(), 1);
				assert.deepStrictEqual(logger.error.mock.calls[0].arguments, [
					{
						event: 'HANDLED_ERROR',
						message: 'MockError',
						error: {
							name: 'MockError'
						},
						request: 'mock-serialized-request',
						app: {
							commit: 'mock-commit-hash',
							name: 'mock-system-code',
							nodeVersion: process.versions.node,
							region: 'mock-region',
							releaseDate: 'mock-release-date',
							processType: 'mock-process-type'
						}
					}
				]);
			});
		});

		describe('when the logger option is set', () => {
			let customLogger;

			beforeEach(() => {
				customLogger = {
					error: mock.fn(),
					fatal: mock.fn(),
					warn: mock.fn()
				};
				logHandledError({
					error,
					request,
					logger: customLogger
				});
			});

			it('logs the serialized error, request, and app details', () => {
				assert.strictEqual(customLogger.error.mock.callCount(), 1);
				assert.deepStrictEqual(customLogger.error.mock.calls[0].arguments, [
					{
						event: 'HANDLED_ERROR',
						message: 'MockError: mock error',
						error: {
							name: 'MockError',
							message: 'mock error'
						},
						request: 'mock-serialized-request',
						app: {
							commit: 'mock-commit-hash',
							name: 'mock-system-code',
							nodeVersion: process.versions.node,
							region: 'mock-region',
							releaseDate: 'mock-release-date',
							processType: 'mock-process-type'
						}
					}
				]);
			});
		});

		describe('when the logUserErrorsAsWarnings option is set to true', () => {
			describe('and the serialized error has a status code in the 4xx range', () => {
				beforeEach(() => {
					serializeError.mock.resetCalls();
					serializeRequest.mock.resetCalls();
					logger.error.mock.resetCalls();
					logger.warn.mock.resetCalls();
					serializeError.mock.mockImplementationOnce(() => ({
						name: 'MockError',
						message: 'mock error',
						statusCode: 456
					}));
					logHandledError({
						error,
						request,
						logUserErrorsAsWarnings: true
					});
				});

				it('logs with a level of "warn" rather than "error"', () => {
					assert.strictEqual(logger.error.mock.callCount(), 0);
					assert.strictEqual(logger.warn.mock.callCount(), 1);
					assert.partialDeepStrictEqual(logger.warn.mock.calls[0].arguments, [
						{
							error: {
								name: 'MockError',
								message: 'mock error',
								statusCode: 456
							}
						}
					]);
				});
			});

			describe('and the serialized error has a status code in the 5xx range', () => {
				beforeEach(() => {
					serializeError.mock.resetCalls();
					serializeRequest.mock.resetCalls();
					logger.error.mock.resetCalls();
					logger.warn.mock.resetCalls();
					serializeError.mock.mockImplementationOnce(() => ({
						name: 'MockError',
						message: 'mock error',
						statusCode: 500
					}));
					logHandledError({
						error,
						request,
						logUserErrorsAsWarnings: true
					});
				});

				it('still logs with a level of "error"', () => {
					assert.strictEqual(logger.warn.mock.callCount(), 0);
					assert.strictEqual(logger.error.mock.callCount(), 1);
					assert.partialDeepStrictEqual(logger.error.mock.calls[0].arguments, [
						{
							error: {
								name: 'MockError',
								message: 'mock error',
								statusCode: 500
							}
						}
					]);
				});
			});

			describe('and the serialized error does not have a status code', () => {
				beforeEach(() => {
					serializeError.mock.resetCalls();
					serializeRequest.mock.resetCalls();
					logger.error.mock.resetCalls();
					logger.warn.mock.resetCalls();
					serializeError.mock.mockImplementationOnce(() => ({
						name: 'MockError',
						message: 'mock error'
					}));
					logHandledError({
						error,
						request,
						logUserErrorsAsWarnings: true
					});
				});

				it('still logs with a level of "error"', () => {
					assert.strictEqual(logger.warn.mock.callCount(), 0);
					assert.strictEqual(logger.error.mock.callCount(), 1);
					assert.partialDeepStrictEqual(logger.error.mock.calls[0].arguments, [
						{
							error: {
								name: 'MockError',
								message: 'mock error'
							}
						}
					]);
				});
			});
		});

		describe('when logging fails', () => {
			let loggingError;

			beforeEach(() => {
				loggingError = new Error('mock logging error');
				mock.method(console, 'log', () => {});
				serializeError.mock.resetCalls();
				serializeError.mock.mockImplementationOnce(
					() => ({
						name: 'MockLoggingError',
						message: 'mock logging error'
					}),
					1
				);
				logger.error.mock.mockImplementationOnce(() => {
					throw loggingError;
				});
				logHandledError({
					error,
					request
				});
			});

			afterEach(() => {
				// biome-ignore lint/suspicious/noConsole: used in the code
				console.log.mock.restore();
			});

			it('logs the serialized error, request, and app details with `console.log` as well as that an error occurred', () => {
				// biome-ignore lint/suspicious/noConsole: used in the code
				assert.strictEqual(console.log.mock.callCount(), 2);
				// biome-ignore lint/suspicious/noConsole: used in the code
				assert.deepStrictEqual(console.log.mock.calls[0].arguments, [
					JSON.stringify({
						level: 'error',
						event: 'LOG_METHOD_FAILURE',
						message: "Failed to log at level 'error'",
						error: {
							name: 'MockLoggingError',
							message: 'mock logging error'
						}
					})
				]);
				// biome-ignore lint/suspicious/noConsole: used in the code
				assert.deepStrictEqual(console.log.mock.calls[1].arguments, [
					JSON.stringify({
						event: 'HANDLED_ERROR',
						message: 'MockError: mock error',
						error: {
							name: 'MockError',
							message: 'mock error'
						},
						app: {
							commit: 'mock-commit-hash',
							name: 'mock-system-code',
							nodeVersion: process.versions.node,
							region: 'mock-region',
							releaseDate: 'mock-release-date',
							processType: 'mock-process-type'
						},
						request: 'mock-serialized-request'
					})
				]);
			});
		});
	});

	describe('logRecoverableError(options)', () => {
		let error;
		let request;

		beforeEach(() => {
			error = new Error('mock error');
			request = { isMockRequest: true };

			logRecoverableError({ error, request });
		});

		it('serializes the error', () => {
			assert.strictEqual(serializeError.mock.callCount(), 1);
			assert.deepStrictEqual(serializeError.mock.calls[0].arguments, [error]);
		});

		it('serializes the request', () => {
			assert.strictEqual(serializeRequest.mock.callCount(), 1);
			assert.deepStrictEqual(serializeRequest.mock.calls[0].arguments, [
				request,
				{ includeHeaders: undefined }
			]);
		});

		it('logs the serialized error, request, and app details', () => {
			assert.strictEqual(logger.warn.mock.callCount(), 1);
			assert.deepStrictEqual(logger.warn.mock.calls[0].arguments, [
				{
					event: 'RECOVERABLE_ERROR',
					message: 'MockError: mock error',
					error: {
						name: 'MockError',
						message: 'mock error'
					},
					request: 'mock-serialized-request',
					app: {
						commit: 'mock-commit-hash',
						name: 'mock-system-code',
						nodeVersion: process.versions.node,
						region: 'mock-region',
						releaseDate: 'mock-release-date',
						processType: 'mock-process-type'
					}
				}
			]);
		});

		describe('when the includeHeaders option is set', () => {
			beforeEach(() => {
				serializeError.mock.resetCalls();
				serializeRequest.mock.resetCalls();
				logger.warn.mock.resetCalls();
				logRecoverableError({
					error,
					request,
					includeHeaders: ['header-1', 'header-2']
				});
			});

			it('serializes the error', () => {
				assert.strictEqual(serializeError.mock.callCount(), 1);
				assert.deepStrictEqual(serializeError.mock.calls[0].arguments, [error]);
			});

			it('serializes the request with the configured headers', () => {
				assert.strictEqual(serializeRequest.mock.callCount(), 1);
				assert.deepStrictEqual(serializeRequest.mock.calls[0].arguments, [
					request,
					{ includeHeaders: ['header-1', 'header-2'] }
				]);
			});

			it('logs the serialized error, request, and app details', () => {
				assert.strictEqual(logger.warn.mock.callCount(), 1);
				assert.deepStrictEqual(logger.warn.mock.calls[0].arguments, [
					{
						event: 'RECOVERABLE_ERROR',
						message: 'MockError: mock error',
						error: {
							name: 'MockError',
							message: 'mock error'
						},
						request: 'mock-serialized-request',
						app: {
							commit: 'mock-commit-hash',
							name: 'mock-system-code',
							nodeVersion: process.versions.node,
							region: 'mock-region',
							releaseDate: 'mock-release-date',
							processType: 'mock-process-type'
						}
					}
				]);
			});
		});

		describe('when the request option is not set', () => {
			beforeEach(() => {
				serializeError.mock.resetCalls();
				serializeRequest.mock.resetCalls();
				logger.warn.mock.resetCalls();
				logRecoverableError({ error });
			});

			it('serializes the error', () => {
				assert.strictEqual(serializeError.mock.callCount(), 1);
				assert.deepStrictEqual(serializeError.mock.calls[0].arguments, [error]);
			});

			it('does not serialize the request', () => {
				assert.strictEqual(serializeRequest.mock.callCount(), 0);
			});

			it('logs the serialized error and app details', () => {
				assert.strictEqual(logger.warn.mock.callCount(), 1);
				assert.deepStrictEqual(logger.warn.mock.calls[0].arguments, [
					{
						event: 'RECOVERABLE_ERROR',
						message: 'MockError: mock error',
						error: {
							name: 'MockError',
							message: 'mock error'
						},
						app: {
							commit: 'mock-commit-hash',
							name: 'mock-system-code',
							nodeVersion: process.versions.node,
							region: 'mock-region',
							releaseDate: 'mock-release-date',
							processType: 'mock-process-type'
						}
					}
				]);
			});
		});

		describe('when the serialized error does not have a name', () => {
			beforeEach(() => {
				serializeError.mock.resetCalls();
				serializeRequest.mock.resetCalls();
				logger.warn.mock.resetCalls();
				serializeError.mock.mockImplementationOnce(() => ({ message: 'mock error' }));
				logRecoverableError({ error, request });
			});

			it('defaults the message to use "Error"', () => {
				assert.strictEqual(logger.warn.mock.callCount(), 1);
				assert.deepStrictEqual(logger.warn.mock.calls[0].arguments, [
					{
						event: 'RECOVERABLE_ERROR',
						message: 'Error: mock error',
						error: {
							message: 'mock error'
						},
						request: 'mock-serialized-request',
						app: {
							commit: 'mock-commit-hash',
							name: 'mock-system-code',
							nodeVersion: process.versions.node,
							region: 'mock-region',
							releaseDate: 'mock-release-date',
							processType: 'mock-process-type'
						}
					}
				]);
			});
		});

		describe('when the serialized error does not have a message', () => {
			beforeEach(() => {
				serializeError.mock.resetCalls();
				serializeRequest.mock.resetCalls();
				logger.warn.mock.resetCalls();
				serializeError.mock.mockImplementationOnce(() => ({ name: 'MockError' }));
				logRecoverableError({ error, request });
			});

			it('defaults the message to only use the name', () => {
				assert.strictEqual(logger.warn.mock.callCount(), 1);
				assert.deepStrictEqual(logger.warn.mock.calls[0].arguments, [
					{
						event: 'RECOVERABLE_ERROR',
						message: 'MockError',
						error: {
							name: 'MockError'
						},
						request: 'mock-serialized-request',
						app: {
							commit: 'mock-commit-hash',
							name: 'mock-system-code',
							nodeVersion: process.versions.node,
							region: 'mock-region',
							releaseDate: 'mock-release-date',
							processType: 'mock-process-type'
						}
					}
				]);
			});
		});

		describe('when the logger option is set', () => {
			let customLogger;

			beforeEach(() => {
				customLogger = {
					error: mock.fn(),
					fatal: mock.fn(),
					warn: mock.fn()
				};
				logRecoverableError({
					error,
					request,
					logger: customLogger
				});
			});

			it('logs the serialized error, request, and app details with the custom logger', () => {
				assert.strictEqual(customLogger.warn.mock.callCount(), 1);
				assert.deepStrictEqual(customLogger.warn.mock.calls[0].arguments, [
					{
						event: 'RECOVERABLE_ERROR',
						message: 'MockError: mock error',
						error: {
							name: 'MockError',
							message: 'mock error'
						},
						request: 'mock-serialized-request',
						app: {
							commit: 'mock-commit-hash',
							name: 'mock-system-code',
							nodeVersion: process.versions.node,
							region: 'mock-region',
							releaseDate: 'mock-release-date',
							processType: 'mock-process-type'
						}
					}
				]);
			});
		});

		describe('when logging fails', () => {
			let loggingError;

			beforeEach(() => {
				loggingError = new Error('mock logging error');
				mock.method(console, 'log', () => {});
				serializeError.mock.resetCalls();
				serializeError.mock.mockImplementationOnce(
					() => ({
						name: 'MockLoggingError',
						message: 'mock logging error'
					}),
					1
				);
				logger.warn.mock.mockImplementationOnce(() => {
					throw loggingError;
				});
				logRecoverableError({
					error,
					request
				});
			});

			afterEach(() => {
				// biome-ignore lint/suspicious/noConsole: used in the code
				console.log.mock.restore();
			});

			it('logs the serialized error, request, and app details with `console.log` as well as that an error occurred', () => {
				// biome-ignore lint/suspicious/noConsole: used in the code
				assert.strictEqual(console.log.mock.callCount(), 2);
				// biome-ignore lint/suspicious/noConsole: used in the code
				assert.deepStrictEqual(console.log.mock.calls[0].arguments, [
					JSON.stringify({
						level: 'error',
						event: 'LOG_METHOD_FAILURE',
						message: "Failed to log at level 'warn'",
						error: {
							name: 'MockLoggingError',
							message: 'mock logging error'
						}
					})
				]);
				// biome-ignore lint/suspicious/noConsole: used in the code
				assert.deepStrictEqual(console.log.mock.calls[1].arguments, [
					JSON.stringify({
						event: 'RECOVERABLE_ERROR',
						message: 'MockError: mock error',
						error: {
							name: 'MockError',
							message: 'mock error'
						},
						app: {
							commit: 'mock-commit-hash',
							name: 'mock-system-code',
							nodeVersion: process.versions.node,
							region: 'mock-region',
							releaseDate: 'mock-release-date',
							processType: 'mock-process-type'
						},
						request: 'mock-serialized-request'
					})
				]);
			});
		});
	});

	describe('logUnhandledError(options)', () => {
		let error;
		let request;

		beforeEach(() => {
			error = new Error('mock error');
			request = { isMockRequest: true };

			logUnhandledError({ error, request });
		});

		it('serializes the error', () => {
			assert.strictEqual(serializeError.mock.callCount(), 1);
			assert.deepStrictEqual(serializeError.mock.calls[0].arguments, [error]);
		});

		it('serializes the request', () => {
			assert.strictEqual(serializeRequest.mock.callCount(), 1);
			assert.deepStrictEqual(serializeRequest.mock.calls[0].arguments, [
				request,
				{ includeHeaders: undefined }
			]);
		});

		it('logs the serialized error, request, and app details', () => {
			assert.strictEqual(logger.fatal.mock.callCount(), 1);
			assert.deepStrictEqual(logger.fatal.mock.calls[0].arguments, [
				{
					event: 'UNHANDLED_ERROR',
					message: 'MockError: mock error',
					error: {
						name: 'MockError',
						message: 'mock error'
					},
					request: 'mock-serialized-request',
					app: {
						commit: 'mock-commit-hash',
						name: 'mock-system-code',
						nodeVersion: process.versions.node,
						region: 'mock-region',
						releaseDate: 'mock-release-date',
						processType: 'mock-process-type'
					}
				}
			]);
		});

		describe('when the includeHeaders option is set', () => {
			beforeEach(() => {
				serializeError.mock.resetCalls();
				serializeRequest.mock.resetCalls();
				logger.fatal.mock.resetCalls();
				logUnhandledError({
					error,
					request,
					includeHeaders: ['header-1', 'header-2']
				});
			});

			it('serializes the error', () => {
				assert.strictEqual(serializeError.mock.callCount(), 1);
				assert.deepStrictEqual(serializeError.mock.calls[0].arguments, [error]);
			});

			it('serializes the request with the configured headers', () => {
				assert.strictEqual(serializeRequest.mock.callCount(), 1);
				assert.deepStrictEqual(serializeRequest.mock.calls[0].arguments, [
					request,
					{ includeHeaders: ['header-1', 'header-2'] }
				]);
			});

			it('logs the serialized error, request, and app details', () => {
				assert.strictEqual(logger.fatal.mock.callCount(), 1);
				assert.deepStrictEqual(logger.fatal.mock.calls[0].arguments, [
					{
						event: 'UNHANDLED_ERROR',
						message: 'MockError: mock error',
						error: {
							name: 'MockError',
							message: 'mock error'
						},
						request: 'mock-serialized-request',
						app: {
							commit: 'mock-commit-hash',
							name: 'mock-system-code',
							nodeVersion: process.versions.node,
							region: 'mock-region',
							releaseDate: 'mock-release-date',
							processType: 'mock-process-type'
						}
					}
				]);
			});
		});

		describe('when the request option is not set', () => {
			beforeEach(() => {
				serializeError.mock.resetCalls();
				serializeRequest.mock.resetCalls();
				logger.fatal.mock.resetCalls();
				logUnhandledError({ error });
			});

			it('serializes the error', () => {
				assert.strictEqual(serializeError.mock.callCount(), 1);
				assert.deepStrictEqual(serializeError.mock.calls[0].arguments, [error]);
			});

			it('does not serialize the request', () => {
				assert.strictEqual(serializeRequest.mock.callCount(), 0);
			});

			it('logs the serialized error and app details', () => {
				assert.strictEqual(logger.fatal.mock.callCount(), 1);
				assert.deepStrictEqual(logger.fatal.mock.calls[0].arguments, [
					{
						event: 'UNHANDLED_ERROR',
						message: 'MockError: mock error',
						error: {
							name: 'MockError',
							message: 'mock error'
						},
						app: {
							commit: 'mock-commit-hash',
							name: 'mock-system-code',
							nodeVersion: process.versions.node,
							region: 'mock-region',
							releaseDate: 'mock-release-date',
							processType: 'mock-process-type'
						}
					}
				]);
			});
		});

		describe('when the serialized error does not have a name', () => {
			beforeEach(() => {
				serializeError.mock.resetCalls();
				serializeRequest.mock.resetCalls();
				logger.fatal.mock.resetCalls();
				serializeError.mock.mockImplementationOnce(() => ({ message: 'mock error' }));
				logUnhandledError({ error, request });
			});

			it('defaults the message to use "Error"', () => {
				assert.strictEqual(logger.fatal.mock.callCount(), 1);
				assert.deepStrictEqual(logger.fatal.mock.calls[0].arguments, [
					{
						event: 'UNHANDLED_ERROR',
						message: 'Error: mock error',
						error: {
							message: 'mock error'
						},
						request: 'mock-serialized-request',
						app: {
							commit: 'mock-commit-hash',
							name: 'mock-system-code',
							nodeVersion: process.versions.node,
							region: 'mock-region',
							releaseDate: 'mock-release-date',
							processType: 'mock-process-type'
						}
					}
				]);
			});
		});

		describe('when the serialized error does not have a message', () => {
			beforeEach(() => {
				serializeError.mock.resetCalls();
				serializeRequest.mock.resetCalls();
				logger.fatal.mock.resetCalls();
				serializeError.mock.mockImplementationOnce(() => ({ name: 'MockError' }));
				logUnhandledError({ error, request });
			});

			it('defaults the message to only use the name', () => {
				assert.strictEqual(logger.fatal.mock.callCount(), 1);
				assert.deepStrictEqual(logger.fatal.mock.calls[0].arguments, [
					{
						event: 'UNHANDLED_ERROR',
						message: 'MockError',
						error: {
							name: 'MockError'
						},
						request: 'mock-serialized-request',
						app: {
							commit: 'mock-commit-hash',
							name: 'mock-system-code',
							nodeVersion: process.versions.node,
							region: 'mock-region',
							releaseDate: 'mock-release-date',
							processType: 'mock-process-type'
						}
					}
				]);
			});
		});

		describe('when the logger option is set', () => {
			let customLogger;

			beforeEach(() => {
				customLogger = {
					error: mock.fn(),
					fatal: mock.fn(),
					warn: mock.fn()
				};
				logUnhandledError({
					error,
					request,
					logger: customLogger
				});
			});

			it('logs the serialized error, request, and app details with the custom logger', () => {
				assert.strictEqual(customLogger.fatal.mock.callCount(), 1);
				assert.deepStrictEqual(customLogger.fatal.mock.calls[0].arguments, [
					{
						event: 'UNHANDLED_ERROR',
						message: 'MockError: mock error',
						error: {
							name: 'MockError',
							message: 'mock error'
						},
						request: 'mock-serialized-request',
						app: {
							commit: 'mock-commit-hash',
							name: 'mock-system-code',
							nodeVersion: process.versions.node,
							region: 'mock-region',
							releaseDate: 'mock-release-date',
							processType: 'mock-process-type'
						}
					}
				]);
			});
		});

		describe('when the logger does not have a `fatal` method', () => {
			let customLogger;

			beforeEach(() => {
				customLogger = {
					error: mock.fn(),
					warn: mock.fn()
				};
				logUnhandledError({
					error,
					request,
					logger: customLogger
				});
			});

			it('logs the serialized error, request, and app details with the custom logger error method', () => {
				assert.strictEqual(customLogger.error.mock.callCount(), 1);
				assert.deepStrictEqual(customLogger.error.mock.calls[0].arguments, [
					{
						event: 'UNHANDLED_ERROR',
						message: 'MockError: mock error',
						error: {
							name: 'MockError',
							message: 'mock error'
						},
						request: 'mock-serialized-request',
						app: {
							commit: 'mock-commit-hash',
							name: 'mock-system-code',
							nodeVersion: process.versions.node,
							region: 'mock-region',
							releaseDate: 'mock-release-date',
							processType: 'mock-process-type'
						}
					}
				]);
			});
		});

		describe('when logging fails', () => {
			let loggingError;

			beforeEach(() => {
				loggingError = new Error('mock logging error');
				mock.method(console, 'log', () => {});
				serializeError.mock.resetCalls();
				serializeError.mock.mockImplementationOnce(
					() => ({
						name: 'MockLoggingError',
						message: 'mock logging error'
					}),
					1
				);
				logger.fatal.mock.mockImplementationOnce(() => {
					throw loggingError;
				});
				logUnhandledError({
					error,
					request
				});
			});

			afterEach(() => {
				// biome-ignore lint/suspicious/noConsole: used in the code
				console.log.mock.restore();
			});

			it('logs the serialized error, request, and app details with `console.log` as well as that an error occurred', () => {
				// biome-ignore lint/suspicious/noConsole: used in the code
				assert.strictEqual(console.log.mock.callCount(), 2);
				// biome-ignore lint/suspicious/noConsole: used in the code
				assert.deepStrictEqual(console.log.mock.calls[0].arguments, [
					JSON.stringify({
						level: 'error',
						event: 'LOG_METHOD_FAILURE',
						message: "Failed to log at level 'fatal'",
						error: {
							name: 'MockLoggingError',
							message: 'mock logging error'
						}
					})
				]);
				// biome-ignore lint/suspicious/noConsole: used in the code
				assert.deepStrictEqual(console.log.mock.calls[1].arguments, [
					JSON.stringify({
						event: 'UNHANDLED_ERROR',
						message: 'MockError: mock error',
						error: {
							name: 'MockError',
							message: 'mock error'
						},
						app: {
							commit: 'mock-commit-hash',
							name: 'mock-system-code',
							nodeVersion: process.versions.node,
							region: 'mock-region',
							releaseDate: 'mock-release-date',
							processType: 'mock-process-type'
						},
						request: 'mock-serialized-request'
					})
				]);
			});
		});
	});
});
