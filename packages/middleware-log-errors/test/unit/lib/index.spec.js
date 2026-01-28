const { afterEach, beforeEach, describe, it, mock } = require('node:test');
const assert = require('node:assert/strict');

const logHandledError = mock.fn();
const logRecoverableError = mock.fn();
mock.module('@dotcom-reliability-kit/log-error', {
	namedExports: { logHandledError, logRecoverableError }
});

const createErrorLoggingMiddleware = require('@dotcom-reliability-kit/middleware-log-errors');

describe('@dotcom-reliability-kit/middleware-log-errors', () => {
	let middleware;

	beforeEach(() => {
		middleware = createErrorLoggingMiddleware();
	});

	describe('.default', () => {
		it('aliases the module exports', () => {
			assert.strictEqual(createErrorLoggingMiddleware.default, createErrorLoggingMiddleware);
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
			next = mock.fn();

			middleware(error, request, response, next);
		});

		afterEach(() => {
			mock.restoreAll();
		});

		it('logs the error and request', () => {
			assert.strictEqual(logHandledError.mock.callCount(), 1);
			assert.partialDeepStrictEqual(logHandledError.mock.calls[0].arguments, [
				{ error, request, includeHeaders: undefined }
			]);
		});

		it('calls `next` with the original error', () => {
			assert.strictEqual(next.mock.callCount(), 1);
			assert.deepStrictEqual(next.mock.calls[0].arguments, [error]);
		});

		describe('when the filter option is set', () => {
			let filter;

			beforeEach(() => {
				logRecoverableError.mock.resetCalls();
				logHandledError.mock.resetCalls();
				next.mock.resetCalls();
			});

			describe('when the filter returns `true`', () => {
				beforeEach(() => {
					filter = mock.fn(() => true);
					middleware = createErrorLoggingMiddleware({ filter });
					middleware(error, request, response, next);
				});

				it('logs the error and request', () => {
					assert.strictEqual(logHandledError.mock.callCount(), 1);
					assert.partialDeepStrictEqual(logHandledError.mock.calls[0].arguments, [
						{ error, request }
					]);
				});

				it('does not log a recoverable error', () => {
					assert.strictEqual(logRecoverableError.mock.callCount(), 0);
				});

				it('calls `next` with the original error', () => {
					assert.strictEqual(next.mock.callCount(), 1);
					assert.deepStrictEqual(next.mock.calls[0].arguments, [error]);
				});
			});

			describe('when the filter returns `false`', () => {
				beforeEach(() => {
					filter = mock.fn(() => false);
					middleware = createErrorLoggingMiddleware({ filter });
					middleware(error, request, response, next);
				});

				it('does not log the error and request', () => {
					assert.strictEqual(logHandledError.mock.callCount(), 0);
				});

				it('does not log a recoverable error', () => {
					assert.strictEqual(logRecoverableError.mock.callCount(), 0);
				});

				it('calls `next` with the original error', () => {
					assert.strictEqual(next.mock.callCount(), 1);
					assert.deepStrictEqual(next.mock.calls[0].arguments, [error]);
				});
			});

			describe('when the filter throws an error', () => {
				let filterError;

				beforeEach(() => {
					filterError = new Error('Bad Filter!');
					filter = mock.fn(() => {
						throw filterError;
					});
					middleware = createErrorLoggingMiddleware({
						filter
					});
					middleware(error, request, response, next);
				});

				it('logs the error and request', () => {
					assert.strictEqual(logHandledError.mock.callCount(), 1);
					assert.partialDeepStrictEqual(logHandledError.mock.calls[0].arguments, [
						{ error, request }
					]);
				});

				it('logs a recoverable error indicating that the filter failed', () => {
					const expectedError = new Error('Log filtering failed');
					expectedError.code = 'LOG_FILTER_FAILURE';
					expectedError.cause = filterError;
					assert.strictEqual(logRecoverableError.mock.callCount(), 1);
					assert.partialDeepStrictEqual(logRecoverableError.mock.calls[0].arguments, [
						{ error: expectedError, request }
					]);
				});

				it('calls `next` with the original error', () => {
					assert.strictEqual(next.mock.callCount(), 1);
					assert.deepStrictEqual(next.mock.calls[0].arguments, [error]);
				});
			});
		});

		describe('when the filter option is set incorrectly', () => {
			it('throws an error', () => {
				const expectedError = new TypeError('The `filter` option must be a function');
				assert.throws(() => {
					createErrorLoggingMiddleware({
						filter: {}
					});
				}, expectedError);
				assert.throws(() => {
					createErrorLoggingMiddleware({
						filter: 'string'
					});
				}, expectedError);
			});
		});

		describe('when the includeHeaders option is set', () => {
			beforeEach(() => {
				logHandledError.mock.resetCalls();
				next.mock.resetCalls();
				middleware = createErrorLoggingMiddleware({
					includeHeaders: ['header-1', 'header-2']
				});
				middleware(error, request, response, next);
			});

			it('logs the error and request passing on the includeHeaders option', () => {
				assert.strictEqual(logHandledError.mock.callCount(), 1);
				assert.partialDeepStrictEqual(logHandledError.mock.calls[0].arguments, [
					{ error, request, includeHeaders: ['header-1', 'header-2'] }
				]);
			});

			it('calls `next` with the original error', () => {
				assert.strictEqual(next.mock.callCount(), 1);
				assert.deepStrictEqual(next.mock.calls[0].arguments, [error]);
			});
		});

		describe('when the includeHeaders option is set incorrectly', () => {
			it('throws an error', () => {
				const expectedError = new TypeError(
					'The `includeHeaders` option must be an array of strings'
				);
				assert.throws(() => {
					createErrorLoggingMiddleware({
						includeHeaders: {}
					});
				}, expectedError);
				assert.throws(() => {
					createErrorLoggingMiddleware({
						includeHeaders: ['string', 123, 'another string']
					});
				}, expectedError);
			});
		});

		describe('when the logger option is set', () => {
			beforeEach(() => {
				logHandledError.mock.resetCalls();
				middleware = createErrorLoggingMiddleware({
					logger: 'mock-logger'
				});
				middleware(error, request, response, next);
			});

			it('passes on the custom logger to the log method', () => {
				assert.strictEqual(logHandledError.mock.callCount(), 1);
				assert.partialDeepStrictEqual(logHandledError.mock.calls[0].arguments, [
					{ error, request, logger: 'mock-logger' }
				]);
			});
		});

		describe('when the logUserErrorsAsWarnings option is set', () => {
			beforeEach(() => {
				logHandledError.mock.resetCalls();
				next.mock.resetCalls();
				middleware = createErrorLoggingMiddleware({
					logUserErrorsAsWarnings: true
				});
				middleware(error, request, response, next);
			});

			it('it passes the option down to the error logging function', () => {
				assert.strictEqual(logHandledError.mock.callCount(), 1);
				assert.partialDeepStrictEqual(logHandledError.mock.calls[0].arguments, [
					{ error, request, logUserErrorsAsWarnings: true }
				]);
			});

			it('calls `next` with the original error', () => {
				assert.strictEqual(next.mock.callCount(), 1);
				assert.deepStrictEqual(next.mock.calls[0].arguments, [error]);
			});
		});

		describe('when logging fails', () => {
			beforeEach(() => {
				next.mock.resetCalls();
				logHandledError.mock.mockImplementationOnce(() => {
					throw new Error('logger error');
				});

				middleware(error, request, response, next);
			});

			it('calls `next` with the original error', () => {
				assert.strictEqual(next.mock.callCount(), 1);
				assert.deepStrictEqual(next.mock.calls[0].arguments, [error]);
			});
		});
	});
});
