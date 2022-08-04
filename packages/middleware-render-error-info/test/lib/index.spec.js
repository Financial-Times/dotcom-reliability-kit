const createErrorRenderingMiddleware = require('../../lib/index');

jest.mock('@dotcom-reliability-kit/serialize-error', () => jest.fn());
const serializeError = require('@dotcom-reliability-kit/serialize-error');
serializeError.mockReturnValue({
	message: 'mock serialized error message',
	name: 'MockSerializedError',
	stack: 'mock serialized error stack',
	statusCode: 456
});

jest.mock('@dotcom-reliability-kit/log-error', () => ({
	logRecoverableError: jest.fn()
}));
const { logRecoverableError } = require('@dotcom-reliability-kit/log-error');

describe('@dotcom-reliability-kit/middleware-render-error-info', () => {
	let middleware;

	beforeEach(() => {
		process.env.NODE_ENV = 'development';
		middleware = createErrorRenderingMiddleware();
	});

	describe('middleware(error, request, response, next)', () => {
		let error;
		let next;
		let request;
		let response;

		beforeEach(() => {
			error = new Error('mock error');
			request = { isMockRequest: true };
			response = {
				send: jest.fn(),
				set: jest.fn(),
				status: jest.fn()
			};
			next = jest.fn();

			middleware(error, request, response, next);
		});

		it('serializes the error', () => {
			expect(serializeError).toBeCalledWith(error);
		});

		it('responds with the serialized error status code', () => {
			expect(response.status).toBeCalledTimes(1);
			expect(response.status).toBeCalledWith(456);
		});

		it('responds with a Content-Type header of "text/html"', () => {
			expect(response.set).toBeCalledTimes(1);
			expect(response.set).toBeCalledWith('content-type', 'text/html');
		});

		it('responds with an HTML representation of the error', () => {
			expect(response.send).toBeCalledTimes(1);
			const html = response.send.mock.calls[0][0];
			expect(typeof html).toBe('string');
			// We replace multiple line break characters with a single one, and
			// remove all tab characters so that formatting whitespace changes
			// in the markup don't break the tests
			expect(
				html
					.replace(/[\r\n]+/g, '\n')
					.replace(/\t+/g, '')
					.trim()
			).toMatchSnapshot();
		});

		it('does not call `next` with the original error', () => {
			expect(next).toBeCalledTimes(0);
		});

		describe('when the serialized error does not have a `statusCode` property', () => {
			beforeEach(() => {
				serializeError.mockReturnValue({
					statusCode: null
				});
				response.status = jest.fn();

				middleware(error, request, response, next);
			});

			it('responds with a 500 status code', () => {
				expect(response.status).toBeCalledTimes(1);
				expect(response.status).toBeCalledWith(500);
			});
		});

		describe('when `process.env.NODE_ENV` is undefined', () => {
			beforeEach(() => {
				delete process.env.NODE_ENV;
				middleware = createErrorRenderingMiddleware();
				response = {
					send: jest.fn(),
					set: jest.fn(),
					status: jest.fn()
				};
				next = jest.fn();
				middleware(error, request, response, next);
			});

			it('behaves in the same way as when `NODE_ENV` is set to "development"', () => {
				expect(serializeError).toBeCalledWith(error);
				expect(response.status).toBeCalledTimes(1);
				expect(response.set).toBeCalledTimes(1);
				expect(response.send).toBeCalledTimes(1);
			});
		});

		describe('when `process.env.NODE_ENV` is set to "production"', () => {
			beforeEach(() => {
				process.env.NODE_ENV = 'production';
				middleware = createErrorRenderingMiddleware();
				response = {
					send: jest.fn(),
					set: jest.fn(),
					status: jest.fn()
				};
				next = jest.fn();
				middleware(error, request, response, next);
			});

			it('does not render and send an error info page', () => {
				expect(response.status).toBeCalledTimes(0);
				expect(response.set).toBeCalledTimes(0);
				expect(response.send).toBeCalledTimes(0);
			});

			it('calls `next` with the original error', () => {
				expect(next).toBeCalledWith(error);
			});
		});

		describe('when rendering the page fails', () => {
			let renderingError;

			beforeEach(() => {
				renderingError = new Error('rendering failed');
				response.send.mockImplementation(() => {
					throw renderingError;
				});
				next = jest.fn();
				middleware(error, request, response, next);
			});

			it('logs the rendering error as recoverable', () => {
				expect(logRecoverableError).toBeCalledTimes(1);
				expect(logRecoverableError).toBeCalledWith({
					error: renderingError,
					request
				});
			});

			it('calls `next` with the original error', () => {
				expect(next).toBeCalledWith(error);
			});
		});
	});
});
