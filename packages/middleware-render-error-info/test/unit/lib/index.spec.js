const { beforeEach, describe, it, mock, before } = require('node:test');
const assert = require('node:assert/strict');

const serializeError = mock.fn(() => ({
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
}));
mock.module('@dotcom-reliability-kit/serialize-error', { defaultExport: serializeError });

const serializeRequest = mock.fn(() => 'mock-serialized-request');
mock.module('@dotcom-reliability-kit/serialize-request', { defaultExport: serializeRequest });

const logRecoverableError = mock.fn();
mock.module('@dotcom-reliability-kit/log-error', {
	namedExports: { logRecoverableError }
});

const appInfo = {};
mock.module('@dotcom-reliability-kit/app-info', { defaultExport: appInfo });

mock.module('node:http', {
	namedExports: {
		STATUS_CODES: {
			456: 'Mock Error',
			500: 'Server Error'
		}
	}
});

const createErrorRenderingMiddleware = require('@dotcom-reliability-kit/middleware-render-error-info');

describe('@dotcom-reliability-kit/middleware-render-error-info', () => {
	let middleware;

	beforeEach(() => {
		appInfo.environment = 'development';
		appInfo.systemCode = 'mock-system-code';
		middleware = createErrorRenderingMiddleware();
	});

	describe('.default', () => {
		it('aliases the module exports', () => {
			assert.strictEqual(
				createErrorRenderingMiddleware.default,
				createErrorRenderingMiddleware
			);
		});
	});

	describe('middleware(error, request, response, next)', () => {
		let error;
		let next;
		let request;
		let response;

		before(() => {
			// The error page template contains the current year
			mock.timers.enable({ now: new Date('1888-01-09T00:00:00Z') });
		});

		beforeEach(() => {
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
				send: mock.fn(),
				set: mock.fn(),
				status: mock.fn()
			};
			next = mock.fn();

			middleware(error, request, response, next);
		});

		it('serializes the error', () => {
			assert.strictEqual(serializeError.mock.callCount(), 1);
			assert.deepStrictEqual(serializeError.mock.calls[0].arguments, [error]);
		});

		it('responds with the serialized error status code', () => {
			assert.strictEqual(response.status.mock.callCount(), 1);
			assert.deepStrictEqual(response.status.mock.calls[0].arguments, [456]);
		});

		it('responds with a Content-Type header of "text/html"', () => {
			assert.strictEqual(response.set.mock.callCount(), 2);
			assert.deepStrictEqual(response.set.mock.calls[0].arguments, [
				'content-type',
				'text/html'
			]);
		});

		it('responds with an error-fingerprint header', () => {
			assert.strictEqual(response.set.mock.callCount(), 2);
			assert.deepStrictEqual(response.set.mock.calls[1].arguments, [
				'error-fingerprint',
				'mock serialized error fingerprint'
			]);
		});

		it('responds with an HTML representation of the error', (test) => {
			assert.strictEqual(response.send.mock.callCount(), 1);
			const html = response.send.mock.calls[0].arguments[0];
			assert.strictEqual(typeof html, 'string');
			// We replace multiple line break characters with a single one, and
			// remove all tab characters so that formatting whitespace changes
			// in the markup don't break the tests
			test.assert.snapshot(
				html
					.replace(/[\r\n]+/g, '\n')
					.replace(/\t+/g, '')
					.trim()
			);
		});

		it('does not call `next` with the original error', () => {
			assert.strictEqual(next.mock.callCount(), 0);
		});

		describe('when the system code is not set', () => {
			beforeEach(() => {
				appInfo.systemCode = null;
				middleware = createErrorRenderingMiddleware();
				response.send = mock.fn();
				middleware(error, request, response, next);
			});

			it('uses the default system code in the Origami Build Service URLs', () => {
				assert.strictEqual(response.send.mock.callCount(), 1);
				const html = response.send.mock.calls[0].arguments[0];
				assert.strictEqual(typeof html, 'string');

				// Regular expressions expecting the URL-encoded Origami default system code
				assert.match(
					html,
					/bundles\/css\?system_code=%24%24%24-no-bizops-system-code-%24%24%24/i
				);
				assert.match(
					html,
					/bundles\/js\?system_code=%24%24%24-no-bizops-system-code-%24%24%24/i
				);
			});

			it('uses a default "application" string in the page title', () => {
				assert.strictEqual(response.send.mock.callCount(), 1);
				const html = response.send.mock.calls[0].arguments[0];
				assert.strictEqual(typeof html, 'string');
				assert.match(html, /<title>MockSerializedError in application<\/title>/);
			});
		});

		describe('when the serialized error does not have a `fingerprint` property', () => {
			beforeEach(() => {
				serializeError.mock.mockImplementationOnce(() => ({
					statusCode: null,
					data: {}
				}));
				response.set = mock.fn();
				response.status = mock.fn();

				middleware(error, request, response, next);
			});

			it('does not respond with an error-fingerprint header', () => {
				assert.strictEqual(response.set.mock.callCount(), 1);
				assert.notDeepStrictEqual(response.set.mock.calls[0].arguments, [
					'error-fingerprint',
					'mock serialized error fingerprint'
				]);
			});
		});

		describe('when the serialized error does not have a `statusCode` property', () => {
			beforeEach(() => {
				serializeError.mock.mockImplementationOnce(() => ({
					statusCode: null,
					data: {}
				}));
				response.status = mock.fn();

				middleware(error, request, response, next);
			});

			it('responds with a 500 status code', () => {
				assert.strictEqual(response.status.mock.callCount(), 1);
				assert.deepStrictEqual(response.status.mock.calls[0].arguments, [500]);
			});
		});

		describe('when the serialized error has a `statusCode` property lower than 400', () => {
			beforeEach(() => {
				serializeError.mock.mockImplementationOnce(() => ({
					statusCode: 399,
					data: {}
				}));
				response.status = mock.fn();

				middleware(error, request, response, next);
			});

			it('responds with a 500 status code', () => {
				assert.strictEqual(response.status.mock.callCount(), 1);
				assert.deepStrictEqual(response.status.mock.calls[0].arguments, [500]);
			});
		});

		describe('when the serialized error has a `statusCode` property greater than 500', () => {
			beforeEach(() => {
				serializeError.mock.mockImplementationOnce(() => ({
					statusCode: 600,
					data: {}
				}));
				response.status = mock.fn();

				middleware(error, request, response, next);
			});

			it('responds with a 500 status code', () => {
				assert.strictEqual(response.status.mock.callCount(), 1);
				assert.deepStrictEqual(response.status.mock.calls[0].arguments, [500]);
			});
		});

		describe('when the response headers have already been sent', () => {
			beforeEach(() => {
				middleware = createErrorRenderingMiddleware();
				response = {
					headersSent: true,
					send: mock.fn(),
					set: mock.fn(),
					status: mock.fn()
				};
				next = mock.fn();
				middleware(error, request, response, next);
			});

			it('does not render and send an error info page', () => {
				assert.strictEqual(response.status.mock.callCount(), 0);
				assert.strictEqual(response.set.mock.callCount(), 0);
				assert.strictEqual(response.send.mock.callCount(), 0);
			});

			it('calls `next` with the original error', () => {
				assert.strictEqual(next.mock.callCount(), 1);
				assert.deepStrictEqual(next.mock.calls[0].arguments, [error]);
			});
		});

		describe('when the environment is set to "production"', () => {
			beforeEach(() => {
				serializeError.mock.mockImplementationOnce(() => ({
					fingerprint: 'mock serialized error fingerprint',
					data: {}
				}));
				appInfo.environment = 'production';
				middleware = createErrorRenderingMiddleware();
				response = {
					send: mock.fn(),
					set: mock.fn(),
					status: mock.fn()
				};
				next = mock.fn();
				middleware(error, request, response, next);
			});

			it('responds with the serialized error status code', () => {
				assert.strictEqual(response.status.mock.callCount(), 1);
				assert.deepStrictEqual(response.status.mock.calls[0].arguments, [500]);
			});

			it('responds with a Content-Type header of "text/html"', () => {
				assert.strictEqual(response.set.mock.callCount(), 2);
				assert.deepStrictEqual(response.set.mock.calls[0].arguments, [
					'content-type',
					'text/html'
				]);
			});

			it('responds with an error-fingerprint header', () => {
				assert.strictEqual(response.set.mock.callCount(), 2);
				assert.deepStrictEqual(response.set.mock.calls[1].arguments, [
					'error-fingerprint',
					'mock serialized error fingerprint'
				]);
			});

			it('responds with a simple status code, message, and fingerprint in the body', () => {
				assert.strictEqual(response.send.mock.callCount(), 1);
				const html = response.send.mock.calls[0].arguments[0];
				assert.strictEqual(
					html,
					'500 Server Error\n(error code: mock serialized error fingerprint)\n'
				);
			});

			it('does not call `next` with the original error', () => {
				assert.strictEqual(next.mock.callCount(), 0);
			});

			describe('when the serialized error has a nonexistent `statusCode` property', () => {
				beforeEach(() => {
					serializeError.mock.mockImplementationOnce(() => ({
						statusCode: 477,
						data: {}
					}));
					response.send = mock.fn();

					middleware(error, request, response, next);
				});

				it('responds with a simple status code and the default server error message in the body', () => {
					assert.strictEqual(response.send.mock.callCount(), 1);
					const html = response.send.mock.calls[0].arguments[0];
					assert.strictEqual(html, '477 Server Error\n');
				});
			});

			describe('when the serialized error does not have a `fingerprint` property', () => {
				beforeEach(() => {
					serializeError.mock.mockImplementationOnce(() => ({
						data: {}
					}));
					response.send = mock.fn();

					middleware(error, request, response, next);
				});

				it('responds with a simple status code and message in the body', () => {
					assert.strictEqual(response.send.mock.callCount(), 1);
					const html = response.send.mock.calls[0].arguments[0];
					assert.strictEqual(html, '500 Server Error\n');
				});
			});
		});

		describe('when rendering the page fails', () => {
			let renderingError;

			beforeEach(() => {
				serializeError.mock.mockImplementationOnce(() => ({
					statusCode: null,
					data: {}
				}));
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
					send: mock.fn(),
					set: mock.fn(),
					status: mock.fn()
				};
				next = mock.fn();
				middleware(error, request, response, next);
			});

			it('logs the rendering error as recoverable', () => {
				assert.strictEqual(logRecoverableError.mock.callCount(), 1);
				assert.deepStrictEqual(logRecoverableError.mock.calls[0].arguments, [
					{
						error: renderingError,
						request,
						logger: undefined
					}
				]);
			});

			it('responds with the serialized error status code', () => {
				assert.strictEqual(response.status.mock.callCount(), 1);
				assert.deepStrictEqual(response.status.mock.calls[0].arguments, [500]);
			});

			it('responds with a Content-Type header of "text/html"', () => {
				assert.strictEqual(response.set.mock.callCount(), 1);
				assert.deepStrictEqual(response.set.mock.calls[0].arguments, [
					'content-type',
					'text/html'
				]);
			});

			it('responds with a simple status code and message in the body', () => {
				assert.strictEqual(response.send.mock.callCount(), 1);
				const html = response.send.mock.calls[0].arguments[0];
				assert.strictEqual(html, '500 Server Error\n');
			});

			it('does not call `next` with the original error', () => {
				assert.strictEqual(next.mock.callCount(), 0);
			});

			describe('when the logger option is set', () => {
				beforeEach(() => {
					logRecoverableError.mock.resetCalls();
					middleware = createErrorRenderingMiddleware({
						logger: 'mock-logger'
					});
					middleware(error, request, response, next);
				});

				it('passes on the custom logger to the log method', () => {
					assert.strictEqual(logRecoverableError.mock.callCount(), 1);
					assert.deepStrictEqual(logRecoverableError.mock.calls[0].arguments, [
						{
							error: renderingError,
							request,
							logger: 'mock-logger'
						}
					]);
				});
			});
		});
	});
});
