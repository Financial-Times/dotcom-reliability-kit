const logError = require('../../../lib');
const { logHandledError, logRecoverableError, logUnhandledError } = logError;

jest.mock('@dotcom-reliability-kit/logger', () => ({
	error: jest.fn(),
	fatal: jest.fn(),
	warn: jest.fn()
}));
const logger = require('@dotcom-reliability-kit/logger');

jest.mock('@dotcom-reliability-kit/serialize-error', () =>
	jest.fn().mockReturnValue({
		name: 'MockError',
		message: 'mock error'
	})
);
const serializeError = require('@dotcom-reliability-kit/serialize-error');

jest.mock('@dotcom-reliability-kit/serialize-request', () =>
	jest.fn().mockReturnValue('mock-serialized-request')
);
const serializeRequest = require('@dotcom-reliability-kit/serialize-request');

jest.mock('@dotcom-reliability-kit/app-info', () => ({}));
const appInfo = require('@dotcom-reliability-kit/app-info');

describe('@dotcom-reliability-kit/log-error', () => {
	beforeEach(() => {
		appInfo.commitHash = 'mock-commit-hash';
		appInfo.region = 'mock-region';
		appInfo.releaseDate = 'mock-release-date';
		appInfo.systemCode = 'mock-system-code';
		appInfo.processType = 'mock-process-type';
	});

	afterEach(() => {
		serializeError.mockClear();
		serializeRequest.mockClear();
		logger.error.mockClear();
		logger.warn.mockClear();
	});

	describe('.default', () => {
		it('aliases the module exports', () => {
			expect(logError.default).toStrictEqual(logError);
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
			expect(serializeError).toHaveBeenCalledWith(error);
		});

		it('serializes the request', () => {
			expect(serializeRequest).toHaveBeenCalledWith(request, {
				includeHeaders: undefined
			});
		});

		it('logs the serialized error, request, and app details', () => {
			expect(logger.error).toHaveBeenCalledWith({
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
			});
		});

		describe('when a system code is not defined', () => {
			beforeEach(() => {
				appInfo.systemCode = null;
				logHandledError({ error, request });
			});

			it('serializes the error', () => {
				expect(serializeError).toHaveBeenCalledWith(error);
			});

			it('serializes the request', () => {
				expect(serializeRequest).toHaveBeenCalledWith(request, {
					includeHeaders: undefined
				});
			});

			it('logs without an app name', () => {
				expect(logger.error).toHaveBeenCalledWith({
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
				});
			});
		});

		describe('when the includeHeaders option is set', () => {
			beforeEach(() => {
				logHandledError({
					error,
					request,
					includeHeaders: ['header-1', 'header-2']
				});
			});

			it('serializes the error', () => {
				expect(serializeError).toHaveBeenCalledWith(error);
			});

			it('serializes the request with the configured headers', () => {
				expect(serializeRequest).toHaveBeenCalledWith(request, {
					includeHeaders: ['header-1', 'header-2']
				});
			});

			it('logs the serialized error, request, and app details', () => {
				expect(logger.error).toHaveBeenCalledWith({
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
				});
			});
		});

		describe('when the request option is not set', () => {
			beforeEach(() => {
				serializeRequest.mockClear();
				logHandledError({ error });
			});

			it('serializes the error', () => {
				expect(serializeError).toHaveBeenCalledWith(error);
			});

			it('does not serialize the request', () => {
				expect(serializeRequest).toHaveBeenCalledTimes(0);
			});

			it('logs the serialized error and app details', () => {
				expect(logger.error).toHaveBeenCalledWith({
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
				});
			});
		});

		describe('when the serialized error does not have a name', () => {
			beforeEach(() => {
				serializeError.mockReturnValueOnce({
					message: 'mock error'
				});
				logHandledError({ error, request });
				serializeError.mockClear();
			});

			it('defaults the message to use "Error"', () => {
				expect(logger.error).toHaveBeenCalledWith({
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
				});
			});
		});

		describe('when the serialized error does not have a message', () => {
			beforeEach(() => {
				serializeError.mockReturnValueOnce({
					name: 'MockError'
				});
				logHandledError({ error, request });
				serializeError.mockClear();
			});

			it('defaults the message to only use the name', () => {
				expect(logger.error).toHaveBeenCalledWith({
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
				});
			});
		});

		describe('when the logger option is set', () => {
			let customLogger;

			beforeEach(() => {
				customLogger = {
					error: jest.fn(),
					fatal: jest.fn(),
					warn: jest.fn()
				};
				logHandledError({
					error,
					request,
					logger: customLogger
				});
			});

			it('logs the serialized error, request, and app details with the custom logger', () => {
				expect(customLogger.error).toHaveBeenCalledWith({
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
				});
			});
		});

		describe('when the logUserErrorsAsWarnings option is set to true', () => {
			describe('and the serialized error has a status code in the 4xx range', () => {
				beforeEach(() => {
					serializeError.mockClear();
					serializeError.mockReturnValueOnce({
						name: 'MockError',
						message: 'mock error',
						statusCode: 456
					});
					logger.error.mockReset();
					logger.warn.mockReset();
					logHandledError({
						error,
						request,
						logUserErrorsAsWarnings: true
					});
				});

				it('logs with a level of "warn" rather than "error"', () => {
					expect(logger.error).toHaveBeenCalledTimes(0);
					expect(logger.warn).toHaveBeenCalledWith(
						expect.objectContaining({
							error: {
								name: 'MockError',
								message: 'mock error',
								statusCode: 456
							}
						})
					);
				});
			});

			describe('and the serialized error has a status code in the 5xx range', () => {
				beforeEach(() => {
					serializeError.mockClear();
					serializeError.mockReturnValueOnce({
						name: 'MockError',
						message: 'mock error',
						statusCode: 500
					});
					logger.error.mockReset();
					logger.warn.mockReset();
					logHandledError({
						error,
						request,
						logUserErrorsAsWarnings: true
					});
				});

				it('still logs with a level of "error"', () => {
					expect(logger.warn).toHaveBeenCalledTimes(0);
					expect(logger.error).toHaveBeenCalledWith(
						expect.objectContaining({
							error: {
								name: 'MockError',
								message: 'mock error',
								statusCode: 500
							}
						})
					);
				});
			});

			describe('and the serialized error does not have a status code', () => {
				beforeEach(() => {
					serializeError.mockClear();
					serializeError.mockReturnValueOnce({
						name: 'MockError',
						message: 'mock error'
					});
					logger.error.mockReset();
					logger.warn.mockReset();
					logHandledError({
						error,
						request,
						logUserErrorsAsWarnings: true
					});
				});

				it('still logs with a level of "error"', () => {
					expect(logger.warn).toHaveBeenCalledTimes(0);
					expect(logger.error).toHaveBeenCalledWith(
						expect.objectContaining({
							error: {
								name: 'MockError',
								message: 'mock error'
							}
						})
					);
				});
			});
		});

		describe('when logging fails', () => {
			let loggingError;

			beforeEach(() => {
				loggingError = new Error('mock logging error');
				jest.spyOn(console, 'log').mockImplementation(() => {});
				serializeError.mockClear();
				serializeError.mockReturnValueOnce({
					name: 'MockError',
					message: 'mock error'
				});
				serializeError.mockReturnValueOnce({
					name: 'MockLoggingError',
					message: 'mock logging error'
				});
				logger.error.mockImplementation(() => {
					throw loggingError;
				});
				logHandledError({
					error,
					request
				});
			});

			it('logs the serialized error, request, and app details with `console.log`', () => {
				// biome-ignore lint/suspicious/noConsole: used in the code
				expect(console.log).toHaveBeenCalledWith(
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
				);
			});

			it('logs that an error occurred with the logger using `console.log`', () => {
				// biome-ignore lint/suspicious/noConsole: used in the code
				expect(console.log).toHaveBeenCalledWith(
					JSON.stringify({
						level: 'error',
						event: 'LOG_METHOD_FAILURE',
						message: "Failed to log at level 'error'",
						error: {
							name: 'MockLoggingError',
							message: 'mock logging error'
						}
					})
				);
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
			expect(serializeError).toHaveBeenCalledWith(error);
		});

		it('serializes the request', () => {
			expect(serializeRequest).toHaveBeenCalledWith(request, {
				includeHeaders: undefined
			});
		});

		it('logs the serialized error, request, and app details', () => {
			expect(logger.warn).toHaveBeenCalledWith({
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
			});
		});

		describe('when the includeHeaders option is set', () => {
			beforeEach(() => {
				logRecoverableError({
					error,
					request,
					includeHeaders: ['header-1', 'header-2']
				});
			});

			it('serializes the error', () => {
				expect(serializeError).toHaveBeenCalledWith(error);
			});

			it('serializes the request with the configured headers', () => {
				expect(serializeRequest).toHaveBeenCalledWith(request, {
					includeHeaders: ['header-1', 'header-2']
				});
			});

			it('logs the serialized error, request, and app details', () => {
				expect(logger.warn).toHaveBeenCalledWith({
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
				});
			});
		});

		describe('when the request option is not set', () => {
			beforeEach(() => {
				serializeRequest.mockClear();
				logRecoverableError({ error });
			});

			it('serializes the error', () => {
				expect(serializeError).toHaveBeenCalledWith(error);
			});

			it('does not serialize the request', () => {
				expect(serializeRequest).toHaveBeenCalledTimes(0);
			});

			it('logs the serialized error and app details', () => {
				expect(logger.warn).toHaveBeenCalledWith({
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
				});
			});
		});

		describe('when the serialized error does not have a name', () => {
			beforeEach(() => {
				serializeError.mockReturnValueOnce({
					message: 'mock error'
				});
				logRecoverableError({ error, request });
				serializeError.mockClear();
			});

			it('defaults the message to use "Error"', () => {
				expect(logger.warn).toHaveBeenCalledWith({
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
				});
			});
		});

		describe('when the serialized error does not have a message', () => {
			beforeEach(() => {
				serializeError.mockReturnValueOnce({
					name: 'MockError'
				});
				logRecoverableError({ error, request });
				serializeError.mockClear();
			});

			it('defaults the message to only use the name', () => {
				expect(logger.warn).toHaveBeenCalledWith({
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
				});
			});
		});

		describe('when the logger option is set', () => {
			let customLogger;

			beforeEach(() => {
				customLogger = {
					error: jest.fn(),
					fatal: jest.fn(),
					warn: jest.fn()
				};
				logRecoverableError({
					error,
					request,
					logger: customLogger
				});
			});

			it('logs the serialized error, request, and app details with the custom logger', () => {
				expect(customLogger.warn).toHaveBeenCalledWith({
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
				});
			});
		});

		describe('when logging fails', () => {
			let loggingError;

			beforeEach(() => {
				loggingError = new Error('mock logging error');
				jest.spyOn(console, 'log').mockImplementation(() => {});
				serializeError.mockClear();
				serializeError.mockReturnValueOnce({
					name: 'MockError',
					message: 'mock error'
				});
				serializeError.mockReturnValueOnce({
					name: 'MockLoggingError',
					message: 'mock logging error'
				});
				logger.warn.mockImplementation(() => {
					throw loggingError;
				});
				logRecoverableError({
					error,
					request
				});
			});

			it('logs the serialized error, request, and app details with `console.log`', () => {
				// biome-ignore lint/suspicious/noConsole: used in the code
				expect(console.log).toHaveBeenCalledWith(
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
				);
			});

			it('logs that an error occurred with the logger using `console.log`', () => {
				// biome-ignore lint/suspicious/noConsole: used in the code
				expect(console.log).toHaveBeenCalledWith(
					JSON.stringify({
						level: 'error',
						event: 'LOG_METHOD_FAILURE',
						message: "Failed to log at level 'warn'",
						error: {
							name: 'MockLoggingError',
							message: 'mock logging error'
						}
					})
				);
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
			expect(serializeError).toHaveBeenCalledWith(error);
		});

		it('serializes the request', () => {
			expect(serializeRequest).toHaveBeenCalledWith(request, {
				includeHeaders: undefined
			});
		});

		it('logs the serialized error, request, and app details', () => {
			expect(logger.fatal).toHaveBeenCalledWith({
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
			});
		});

		describe('when the includeHeaders option is set', () => {
			beforeEach(() => {
				logUnhandledError({
					error,
					request,
					includeHeaders: ['header-1', 'header-2']
				});
			});

			it('serializes the error', () => {
				expect(serializeError).toHaveBeenCalledWith(error);
			});

			it('serializes the request with the configured headers', () => {
				expect(serializeRequest).toHaveBeenCalledWith(request, {
					includeHeaders: ['header-1', 'header-2']
				});
			});

			it('logs the serialized error, request, and app details', () => {
				expect(logger.fatal).toHaveBeenCalledWith({
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
				});
			});
		});

		describe('when the request option is not set', () => {
			beforeEach(() => {
				serializeRequest.mockClear();
				logUnhandledError({ error });
			});

			it('serializes the error', () => {
				expect(serializeError).toHaveBeenCalledWith(error);
			});

			it('does not serialize the request', () => {
				expect(serializeRequest).toHaveBeenCalledTimes(0);
			});

			it('logs the serialized error and app details', () => {
				expect(logger.fatal).toHaveBeenCalledWith({
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
				});
			});
		});

		describe('when the serialized error does not have a name', () => {
			beforeEach(() => {
				serializeError.mockReturnValueOnce({
					message: 'mock error'
				});
				logUnhandledError({ error, request });
				serializeError.mockClear();
			});

			it('defaults the message to use "Error"', () => {
				expect(logger.fatal).toHaveBeenCalledWith({
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
				});
			});
		});

		describe('when the serialized error does not have a message', () => {
			beforeEach(() => {
				serializeError.mockReturnValueOnce({
					name: 'MockError'
				});
				logUnhandledError({ error, request });
				serializeError.mockClear();
			});

			it('defaults the message to only use the name', () => {
				expect(logger.fatal).toHaveBeenCalledWith({
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
				});
			});
		});

		describe('when the logger option is set', () => {
			let customLogger;

			beforeEach(() => {
				customLogger = {
					error: jest.fn(),
					fatal: jest.fn(),
					warn: jest.fn()
				};
				logUnhandledError({
					error,
					request,
					logger: customLogger
				});
			});

			it('logs the serialized error, request, and app details with the custom logger', () => {
				expect(customLogger.fatal).toHaveBeenCalledWith({
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
				});
			});
		});

		describe('when the logger does not have a `fatal` method', () => {
			let customLogger;

			beforeEach(() => {
				customLogger = {
					error: jest.fn(),
					warn: jest.fn()
				};
				logUnhandledError({
					error,
					request,
					logger: customLogger
				});
			});

			it('logs the serialized error, request, and app details with the custom logger error method', () => {
				expect(customLogger.error).toHaveBeenCalledWith({
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
				});
			});
		});

		describe('when logging fails', () => {
			let loggingError;

			beforeEach(() => {
				loggingError = new Error('mock logging error');
				jest.spyOn(console, 'log').mockImplementation(() => {});
				serializeError.mockClear();
				serializeError.mockReturnValueOnce({
					name: 'MockError',
					message: 'mock error'
				});
				serializeError.mockReturnValueOnce({
					name: 'MockLoggingError',
					message: 'mock logging error'
				});
				logger.fatal.mockImplementation(() => {
					throw loggingError;
				});
				logUnhandledError({
					error,
					request
				});
			});

			it('logs the serialized error, request, and app details with `console.log`', () => {
				// biome-ignore lint/suspicious/noConsole: used in the code
				expect(console.log).toHaveBeenCalledWith(
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
				);
			});

			it('logs that an error occurred with the logger using `console.log`', () => {
				// biome-ignore lint/suspicious/noConsole: used in the code
				expect(console.log).toHaveBeenCalledWith(
					JSON.stringify({
						level: 'error',
						event: 'LOG_METHOD_FAILURE',
						message: "Failed to log at level 'fatal'",
						error: {
							name: 'MockLoggingError',
							message: 'mock logging error'
						}
					})
				);
			});
		});
	});
});
