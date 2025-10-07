const createErrorLoggingMiddleware = require('../../../lib/index');

jest.mock('@dotcom-reliability-kit/log-error', () => ({
	logHandledError: jest.fn(),
	logRecoverableError: jest.fn()
}));
const {
	logHandledError,
	logRecoverableError
} = require('@dotcom-reliability-kit/log-error');

describe('@dotcom-reliability-kit/middleware-log-errors', () => {
	let middleware;

	beforeEach(() => {
		middleware = createErrorLoggingMiddleware();
	});

	describe('.default', () => {
		it('aliases the module exports', () => {
			expect(createErrorLoggingMiddleware.default).toStrictEqual(
				createErrorLoggingMiddleware
			);
		});
	});

	describe('middleware(error, request, response, next)', () => {
		let error;
		let next;
		let request;
		let response;

		beforeEach(() => {
			error = new Error('mock error');
			request = { isMockRequest: true };
			response = { locals: {} };
			next = jest.fn();

			middleware(error, request, response, next);
		});

		it('logs the error and request', () => {
			expect(logHandledError).toHaveBeenCalledWith({
				error,
				request,
				includeHeaders: undefined
			});
		});

		it('calls `next` with the original error', () => {
			expect(next).toHaveBeenCalledWith(error);
		});

		describe('when the filter option is set', () => {
			let filter;

			beforeEach(() => {
				logHandledError.mockReset();
				next.mockReset();
			});

			describe('when the filter returns `true`', () => {
				beforeEach(() => {
					filter = jest.fn().mockReturnValue(true);
					middleware = createErrorLoggingMiddleware({
						filter
					});
					middleware(error, request, response, next);
				});

				it('logs the error and request', () => {
					expect(logHandledError).toHaveBeenCalledWith({
						error,
						request
					});
				});

				it('does not log a recoverable error', () => {
					expect(logRecoverableError).toHaveBeenCalledTimes(0);
				});

				it('calls `next` with the original error', () => {
					expect(next).toHaveBeenCalledWith(error);
				});
			});

			describe('when the filter returns `false`', () => {
				beforeEach(() => {
					filter = jest.fn().mockReturnValue(false);
					middleware = createErrorLoggingMiddleware({
						filter
					});
					middleware(error, request, response, next);
				});

				it('does not log the error and request', () => {
					expect(logHandledError).toHaveBeenCalledTimes(0);
				});

				it('does not log a recoverable error', () => {
					expect(logRecoverableError).toHaveBeenCalledTimes(0);
				});

				it('calls `next` with the original error', () => {
					expect(next).toHaveBeenCalledWith(error);
				});
			});

			describe('when the filter throws an error', () => {
				let filterError;

				beforeEach(() => {
					filterError = new Error('Bad Filter!');
					filter = jest.fn().mockImplementation(() => {
						throw filterError;
					});
					middleware = createErrorLoggingMiddleware({
						filter
					});
					middleware(error, request, response, next);
				});

				it('logs the error and request', () => {
					expect(logHandledError).toHaveBeenCalledWith({
						error,
						request
					});
				});

				it('logs a recoverable error indicating that the filter failed', () => {
					const expectedError = new Error('Log filtering failed');
					expectedError.code = 'LOG_FILTER_FAILURE';
					expectedError.cause = filterError;
					expect(logRecoverableError).toHaveBeenCalledWith({
						error: expectedError,
						request
					});
				});

				it('calls `next` with the original error', () => {
					expect(next).toHaveBeenCalledWith(error);
				});
			});
		});

		describe('when the filter option is set incorrectly', () => {
			it('throws an error', () => {
				const expectedError = new TypeError(
					'The `filter` option must be a function'
				);
				expect(() => {
					createErrorLoggingMiddleware({
						filter: {}
					});
				}).toThrow(expectedError);
				expect(() => {
					createErrorLoggingMiddleware({
						filter: 'string'
					});
				}).toThrow(expectedError);
			});
		});

		describe('when the includeHeaders option is set', () => {
			beforeEach(() => {
				middleware = createErrorLoggingMiddleware({
					includeHeaders: ['header-1', 'header-2']
				});
				middleware(error, request, response, next);
			});

			it('logs the error and request passing on the includeHeaders option', () => {
				expect(logHandledError).toHaveBeenCalledWith({
					error,
					request,
					includeHeaders: ['header-1', 'header-2']
				});
			});

			it('calls `next` with the original error', () => {
				expect(next).toHaveBeenCalledWith(error);
			});
		});

		describe('when the includeHeaders option is set incorrectly', () => {
			it('throws an error', () => {
				const expectedError = new TypeError(
					'The `includeHeaders` option must be an array of strings'
				);
				expect(() => {
					createErrorLoggingMiddleware({
						includeHeaders: {}
					});
				}).toThrow(expectedError);
				expect(() => {
					createErrorLoggingMiddleware({
						includeHeaders: ['string', 123, 'another string']
					});
				}).toThrow(expectedError);
			});
		});

		describe('when the logger option is set', () => {
			beforeEach(() => {
				middleware = createErrorLoggingMiddleware({
					logger: 'mock-logger'
				});
				middleware(error, request, response, next);
			});

			it('passes on the custom logger to the log method', () => {
				expect(logHandledError).toHaveBeenCalledWith({
					error,
					request,
					logger: 'mock-logger'
				});
			});
		});

		describe('when the logUserErrorsAsWarnings option is set', () => {
			beforeEach(() => {
				middleware = createErrorLoggingMiddleware({
					logUserErrorsAsWarnings: true
				});
				middleware(error, request, response, next);
			});

			it('it passes the option down to the error logging function', () => {
				expect(logHandledError).toHaveBeenCalledWith({
					error,
					request,
					logUserErrorsAsWarnings: true
				});
			});

			it('calls `next` with the original error', () => {
				expect(next).toHaveBeenCalledWith(error);
			});
		});

		describe('when logging fails', () => {
			beforeEach(() => {
				logHandledError.mockImplementation(() => {
					throw new Error('logger error');
				});

				middleware(error, request, response, next);
			});

			it('calls `next` with the original error', () => {
				expect(next).toHaveBeenCalledWith(error);
			});
		});
	});
});
