const createErrorRenderingMiddleware = require('../../lib/index');

jest.mock('@dotcom-reliability-kit/serialize-error', () => jest.fn());
const serializeError = require('@dotcom-reliability-kit/serialize-error');
serializeError.mockReturnValue({
	// We nest multiple causes so that we can test each
	// kind of error warning which might appear in the
	// output. E.g. operational error vs non-error thrown
	cause: {
		cause: {
			data: {}
		},
		data: {},
		isOperational: false,
		message: 'mock caused error message',
		relatesToSystems: [],
		stack: 'mock caused error stack'
	},
	code: 'MOCK_SERIALIZED_ERROR_CODE',
	data: {
		booleanValue: true,
		stringValue: 'mock value',
		numberValue: 123,
		arrayValue: ['mock', 'array'],
		objectValue: { isObject: true }
	},
	isOperational: true,
	message: 'mock serialized error message',
	name: 'MockSerializedError',
	relatesToSystems: ['mock-system-1', 'mock-system-2'],
	stack: 'mock serialized error stack <script>oops</script>',
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
		process.env.SYSTEM_CODE = 'mock-system-code';
		middleware = createErrorRenderingMiddleware();
	});

	describe('middleware(error, request, response, next)', () => {
		let error;
		let next;
		let request;
		let response;

		beforeEach(() => {
			error = new Error('mock error');
			request = {
				method: 'mock request method',
				path: 'mock request path',
				query: {
					'mock-request-query': 'yes'
				},
				headers: {
					'mock-request-header': 'yes'
				}
			};
			response = {
				status: 'mock response status',
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

		describe('when the `SYSTEM_CODE` environment variable is not set', () => {
			beforeEach(() => {
				delete process.env.SYSTEM_CODE;
				middleware = createErrorRenderingMiddleware();
				response.send = jest.fn();
				middleware(error, request, response, next);
			});

			it('uses the default system code in the Origami Build Service URLs', () => {
				expect(response.send).toBeCalledTimes(1);
				const html = response.send.mock.calls[0][0];
				expect(typeof html).toBe('string');

				// Regular expressions expecting the URL-encoded Origami default system code
				expect(html).toMatch(
					/bundles\/css\?system_code=%24%24%24-no-bizops-system-code-%24%24%24/i
				);
				expect(html).toMatch(
					/bundles\/js\?system_code=%24%24%24-no-bizops-system-code-%24%24%24/i
				);
			});

			it('uses a default "application" string in the page title', () => {
				expect(response.send).toBeCalledTimes(1);
				const html = response.send.mock.calls[0][0];
				expect(typeof html).toBe('string');
				expect(html).toMatch(
					/<title>MockSerializedError in application<\/title>/
				);
			});
		});

		describe('when the serialized error does not have a `statusCode` property', () => {
			beforeEach(() => {
				serializeError.mockReturnValue({
					statusCode: null,
					data: {}
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
					status: 'mock response status',
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
					status: 'mock response status',
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
