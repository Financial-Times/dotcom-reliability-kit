const createErrorRenderingMiddleware = require('../../../lib/index');

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
	fingerprint: 'mock serialized error fingerprint',
	stack: 'mock serialized error stack <script>oops</script>',
	statusCode: 456
});

jest.mock('@dotcom-reliability-kit/log-error', () => ({
	logRecoverableError: jest.fn()
}));
const { logRecoverableError } = require('@dotcom-reliability-kit/log-error');

jest.mock('@dotcom-reliability-kit/app-info', () => ({}));
const appInfo = require('@dotcom-reliability-kit/app-info');

jest.mock('node:http', () => ({
	STATUS_CODES: {
		456: 'Mock Error',
		500: 'Server Error'
	}
}));

describe('@dotcom-reliability-kit/middleware-render-error-info', () => {
	let middleware;

	beforeEach(() => {
		appInfo.environment = 'development';
		appInfo.systemCode = 'mock-system-code';
		middleware = createErrorRenderingMiddleware();
	});

	describe('.default', () => {
		it('aliases the module exports', () => {
			expect(createErrorRenderingMiddleware.default).toStrictEqual(
				createErrorRenderingMiddleware
			);
		});
	});

	describe('middleware(error, request, response, next)', () => {
		let error;
		let next;
		let request;
		let response;

		beforeEach(() => {
			// The error page template contains the current year
			jest.useFakeTimers().setSystemTime(new Date('1888-01-09'));

			error = new Error('mock error');
			request = {
				method: 'mock request method',
				path: 'mock request path',
				query: {
					'mock-request-query': 'yes',
					'x-api-key': 'foo' // 'x-api-key' is a concealed request property name
				},
				headers: {
					'mock-request-header': 'yes',
					cookie: 'bar' // 'cookie' is a concealed request property name
				}
			};
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
			expect(response.set).toBeCalledWith('content-type', 'text/html');
		});

		it('responds with an error-fingerprint header', () => {
			expect(response.set).toBeCalledWith(
				'error-fingerprint',
				'mock serialized error fingerprint'
			);
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

		describe('when the system code is not set', () => {
			beforeEach(() => {
				appInfo.systemCode = null;
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

		describe('when the serialized error does not have a `fingerprint` property', () => {
			beforeEach(() => {
				serializeError.mockReturnValue({
					fingerprint: 'mockfingerprint',
					statusCode: null,
					data: {}
				});
				response.set = jest.fn();
				response.status = jest.fn();

				middleware(error, request, response, next);
			});

			it('does not respond with an error-fingerprint header', () => {
				expect(response.set).not.toHaveBeenCalledWith(
					'error-fingerprint',
					'mock serialized error fingerprint'
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

		describe('when the serialized error has a `statusCode` property lower than 400', () => {
			beforeEach(() => {
				serializeError.mockReturnValue({
					statusCode: 399,
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

		describe('when the serialized error has a `statusCode` property greater than 500', () => {
			beforeEach(() => {
				serializeError.mockReturnValue({
					statusCode: 600,
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

		describe('when the response headers have already been sent', () => {
			beforeEach(() => {
				middleware = createErrorRenderingMiddleware();
				response = {
					headersSent: true,
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

		describe('when the environment is set to "production"', () => {
			beforeEach(() => {
				serializeError.mockReturnValueOnce({
					fingerprint: 'mock serialized error fingerprint',
					data: {}
				});
				appInfo.environment = 'production';
				middleware = createErrorRenderingMiddleware();
				response = {
					send: jest.fn(),
					set: jest.fn(),
					status: jest.fn()
				};
				next = jest.fn();
				middleware(error, request, response, next);
			});

			it('responds with the serialized error status code', () => {
				expect(response.status).toBeCalledTimes(1);
				expect(response.status).toBeCalledWith(500);
			});

			it('responds with a Content-Type header of "text/html"', () => {
				expect(response.set).toBeCalledWith('content-type', 'text/html');
			});

			it('responds with an error-fingerprint header', () => {
				expect(response.set).toBeCalledWith(
					'error-fingerprint',
					'mock serialized error fingerprint'
				);
			});

			it('responds with a simple status code, message, and fingerprint in the body', () => {
				expect(response.send).toBeCalledTimes(1);
				const html = response.send.mock.calls[0][0];
				expect(html).toStrictEqual(
					'500 Server Error\n(error code: mock serialized error fingerprint)\n'
				);
			});

			it('does not call `next` with the original error', () => {
				expect(next).toBeCalledTimes(0);
			});

			describe('when the serialized error has a nonexistent `statusCode` property', () => {
				beforeEach(() => {
					serializeError.mockReturnValueOnce({
						statusCode: 477,
						data: {}
					});
					response.send = jest.fn();

					middleware(error, request, response, next);
				});

				it('responds with a simple status code and the default server error message in the body', () => {
					expect(response.send).toBeCalledTimes(1);
					const html = response.send.mock.calls[0][0];
					expect(html).toStrictEqual('477 Server Error\n');
				});
			});

			describe('when the serialized error does not have a `fingerprint` property', () => {
				beforeEach(() => {
					serializeError.mockReturnValueOnce({
						data: {}
					});
					response.send = jest.fn();

					middleware(error, request, response, next);
				});

				it('responds with a simple status code and message in the body', () => {
					expect(response.send).toBeCalledTimes(1);
					const html = response.send.mock.calls[0][0];
					expect(html).toStrictEqual('500 Server Error\n');
				});
			});
		});

		describe('when rendering the page fails', () => {
			let renderingError;

			beforeEach(() => {
				renderingError = new Error('rendering failed');

				// We fail getting the request method as this will
				// ensure that the rendering fails without having
				// to mock the entire rendering method
				delete request.method;
				Object.defineProperty(request, 'method', {
					get: () => {
						throw renderingError;
					}
				});

				response = {
					send: jest.fn(),
					set: jest.fn(),
					status: jest.fn()
				};
				next = jest.fn();
				middleware(error, request, response, next);
			});

			it('logs the rendering error as recoverable', () => {
				expect(logRecoverableError).toBeCalledTimes(1);
				expect(logRecoverableError).toBeCalledWith({
					error: renderingError,
					request,
					logger: undefined
				});
			});

			it('responds with the serialized error status code', () => {
				expect(response.status).toBeCalledTimes(1);
				expect(response.status).toBeCalledWith(500);
			});

			it('responds with a Content-Type header of "text/html"', () => {
				expect(response.set).toBeCalledTimes(1);
				expect(response.set).toBeCalledWith('content-type', 'text/html');
			});

			it('responds with a simple status code and message in the body', () => {
				expect(response.send).toBeCalledTimes(1);
				const html = response.send.mock.calls[0][0];
				expect(html).toStrictEqual('500 Server Error\n');
			});

			it('does not call `next` with the original error', () => {
				expect(next).toBeCalledTimes(0);
			});

			describe('when the logger option is set', () => {
				beforeEach(() => {
					middleware = createErrorRenderingMiddleware({
						logger: 'mock-logger'
					});
					middleware(error, request, response, next);
				});

				it('passes on the custom logger to the log method', () => {
					expect(logRecoverableError).toBeCalledWith({
						error: renderingError,
						request,
						logger: 'mock-logger'
					});
				});
			});
		});
	});
});
