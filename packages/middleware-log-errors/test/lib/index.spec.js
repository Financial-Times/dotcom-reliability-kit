const createErrorLoggingMiddleware = require('../../lib/index');

jest.mock('@financial-times/n-logger', () => ({
	default: { error: jest.fn() }
}));
const logger = require('@financial-times/n-logger').default;

jest.mock('@dotcom-reliability-kit/serialize-error', () =>
	jest.fn().mockReturnValue('mock-serialized-error')
);
const serializeError = require('@dotcom-reliability-kit/serialize-error');

jest.mock('@dotcom-reliability-kit/serialize-request', () =>
	jest.fn().mockReturnValue('mock-serialized-request')
);
const serializeRequest = require('@dotcom-reliability-kit/serialize-request');

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
			process.env.REGION = 'mock-region';
			error = new Error('mock error');
			request = { isMockRequest: true };
			response = {
				getHeader: jest.fn()
			};
			next = jest.fn();

			response.getHeader.mockImplementation((header) => {
				return `mock-response-${header}-value`;
			});

			middleware(error, request, response, next);
		});

		it('serializes the error', () => {
			expect(serializeError).toBeCalledWith(error);
		});

		it('serializes the request', () => {
			expect(serializeRequest).toBeCalledWith(request, {
				includeHeaders: undefined
			});
		});

		it('logs the serialized error, request, and app details', () => {
			expect(logger.error).toBeCalledWith({
				event: 'HANDLED_ERROR',
				error: 'mock-serialized-error',
				request: 'mock-serialized-request',
				app: {
					name: 'mock-response-ft-app-name-value',
					region: 'mock-region'
				}
			});
		});

		it('calls `next` with the original error', () => {
			expect(next).toBeCalledWith(error);
		});

		describe('when the response has no "ft-app-name" header', () => {
			beforeEach(() => {
				response.getHeader.mockImplementation(() => undefined);
				middleware(error, request, response, next);
			});

			it('serializes the error', () => {
				expect(serializeError).toBeCalledWith(error);
			});

			it('serializes the request', () => {
				expect(serializeRequest).toBeCalledWith(request, {
					includeHeaders: undefined
				});
			});

			it('logs without an app name', () => {
				expect(logger.error).toBeCalledWith({
					event: 'HANDLED_ERROR',
					error: 'mock-serialized-error',
					request: 'mock-serialized-request',
					app: {
						name: null,
						region: 'mock-region'
					}
				});
			});

			it('calls `next` with the original error', () => {
				expect(next).toBeCalledWith(error);
			});
		});

		describe('when `process.env.REGION` is not defined', () => {
			beforeEach(() => {
				delete process.env.REGION;
				middleware(error, request, response, next);
			});

			it('serializes the error', () => {
				expect(serializeError).toBeCalledWith(error);
			});

			it('logs without an app region', () => {
				expect(logger.error).toBeCalledWith({
					event: 'HANDLED_ERROR',
					error: 'mock-serialized-error',
					request: 'mock-serialized-request',
					app: {
						name: 'mock-response-ft-app-name-value',
						region: null
					}
				});
			});

			it('calls `next` with the original error', () => {
				expect(next).toBeCalledWith(error);
			});
		});

		describe('when the includeHeaders option is set', () => {
			beforeEach(() => {
				middleware = createErrorLoggingMiddleware({
					includeHeaders: ['header-1', 'header-2']
				});
				middleware(error, request, response, next);
			});

			it('serializes the error', () => {
				expect(serializeError).toBeCalledWith(error);
			});

			it('serializes the request with the configured headers', () => {
				expect(serializeRequest).toBeCalledWith(request, {
					includeHeaders: ['header-1', 'header-2']
				});
			});

			it('logs the serialized error, request, and app details', () => {
				expect(logger.error).toBeCalledWith({
					event: 'HANDLED_ERROR',
					error: 'mock-serialized-error',
					request: 'mock-serialized-request',
					app: {
						name: 'mock-response-ft-app-name-value',
						region: 'mock-region'
					}
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
				logger.error.mockImplementation(() => {
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
