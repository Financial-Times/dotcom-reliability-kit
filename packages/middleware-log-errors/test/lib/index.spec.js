const createErrorLoggingMiddleware = require('../../lib/index');

jest.mock('@dotcom-reliability-kit/log-error', () => ({
	logHandledError: jest.fn().mockReturnValue('mock-serialized-error')
}));
const { logHandledError } = require('@dotcom-reliability-kit/log-error');

describe('@dotcom-reliability-kit/middleware-log-errors', () => {
	let middleware;

	beforeEach(() => {
		middleware = createErrorLoggingMiddleware();
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
			expect(logHandledError).toBeCalledWith({
				error,
				request,
				includeHeaders: undefined
			});
		});

		it('suppresses Raven error logging', () => {
			expect(response.locals.suppressRavenLogger).toStrictEqual(true);
		});

		it('calls `next` with the original error', () => {
			expect(next).toBeCalledWith(error);
		});

		describe('when the includeHeaders option is set', () => {
			beforeEach(() => {
				middleware = createErrorLoggingMiddleware({
					includeHeaders: ['header-1', 'header-2']
				});
				middleware(error, request, response, next);
			});

			it('logs the error and request passing on the includeHeaders option', () => {
				expect(logHandledError).toBeCalledWith({
					error,
					request,
					includeHeaders: ['header-1', 'header-2']
				});
			});

			it('calls `next` with the original error', () => {
				expect(next).toBeCalledWith(error);
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
				}).toThrowError(expectedError);
				expect(() => {
					createErrorLoggingMiddleware({
						includeHeaders: ['string', 123, 'another string']
					});
				}).toThrowError(expectedError);
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
				expect(next).toBeCalledWith(error);
			});
		});
	});
});
