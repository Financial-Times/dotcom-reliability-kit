const { beforeEach, describe, it, mock } = require('node:test');
const assert = require('node:assert/strict');

const Writable = mock.fn(class Writable {});
mock.module('node:stream', { namedExports: { Writable } });

const createFetchErrorHandler = require('../../../lib/create-handler.js');

describe('@dotcom-reliability-kit/fetch-error-handler/lib/create-handler', () => {
	let fetchErrorHandler;

	describe('createFetchErrorHandler()', () => {
		beforeEach(() => {
			fetchErrorHandler = createFetchErrorHandler();
		});

		it('returns a handler function', () => {
			assert.ok(fetchErrorHandler instanceof Function);
		});

		describe('fetchErrorHandler(response)', () => {
			let mockResponse;
			let resolvedValue;

			beforeEach(async () => {
				mockResponse = {
					ok: true,
					status: 200,
					url: 'https://mock.com/example',
					body: {}
				};
				resolvedValue = await fetchErrorHandler(mockResponse);
			});

			it('resolves with the response object', () => {
				assert.strictEqual(resolvedValue, mockResponse);
			});

			describe('when `response.ok` is `false` and `response.status` is 304', () => {
				it('resolves with the response object', async () => {
					mockResponse.ok = false;
					mockResponse.status = 304;
					resolvedValue = await fetchErrorHandler(mockResponse);
					assert.strictEqual(resolvedValue, mockResponse);
				});
			});

			describe('when `response.ok` is `false` and `response.status` is 400', () => {
				it('rejects with an error describing the issue', async () => {
					try {
						mockResponse.ok = false;
						mockResponse.status = 400;
						await fetchErrorHandler(mockResponse);
						assert.fail('Unreachable: function above should error before this');
					} catch (error) {
						assert.ok(error instanceof Error);
						assert.strictEqual(
							error.message,
							'The upstream service at "mock.com" responded with a 400 status'
						);
						assert.partialDeepStrictEqual(Object.assign({}, error), {
							code: 'FETCH_CLIENT_ERROR',
							statusCode: 500,
							relatesToSystems: [],
							data: {
								upstreamUrl: 'https://mock.com/example',
								upstreamStatusCode: 400
							}
						});
					}
				});
			});

			describe('when `response.ok` is `false` and `response.status` is 500', () => {
				it('rejects with an error describing the issue', async () => {
					try {
						mockResponse.ok = false;
						mockResponse.status = 500;
						await fetchErrorHandler(mockResponse);
						assert.fail('Unreachable: function above should error before this');
					} catch (error) {
						assert.ok(error instanceof Error);
						assert.strictEqual(
							error.message,
							'The upstream service at "mock.com" responded with a 500 status'
						);
						assert.partialDeepStrictEqual(Object.assign({}, error), {
							code: 'FETCH_SERVER_ERROR',
							statusCode: 502,
							relatesToSystems: [],
							data: {
								upstreamUrl: 'https://mock.com/example',
								upstreamStatusCode: 500
							}
						});
					}
				});
			});

			describe('when `response.ok` is `false` and `response.status` is 600', () => {
				it('rejects with an error describing the issue', async () => {
					try {
						mockResponse.ok = false;
						mockResponse.status = 600;
						await fetchErrorHandler(mockResponse);
						assert.fail('Unreachable: function above should error before this');
					} catch (error) {
						assert.ok(error instanceof Error);
						assert.strictEqual(
							error.message,
							'The upstream service at "mock.com" responded with a 600 status'
						);
						assert.partialDeepStrictEqual(Object.assign({}, error), {
							code: 'FETCH_UNKNOWN_ERROR',
							statusCode: 500,
							relatesToSystems: [],
							data: {
								upstreamUrl: 'https://mock.com/example',
								upstreamStatusCode: 600
							}
						});
					}
				});
			});

			describe('when `response.ok` is `false` and `response.url` is not a string', () => {
				it('uses "unknown" in the error message rather than a hostname', async () => {
					try {
						mockResponse.ok = false;
						mockResponse.status = 400;
						mockResponse.url = null;
						await fetchErrorHandler(mockResponse);
						assert.fail('Unreachable: function above should error before this');
					} catch (error) {
						assert.ok(error instanceof Error);
						assert.strictEqual(
							error.message,
							'The upstream service at "unknown" responded with a 400 status'
						);
					}
				});
			});

			describe('when `response.ok` is `false` and `response.url` is a string but is not a valid URL', () => {
				it('uses "unknown" in the error message rather than a hostname', async () => {
					try {
						mockResponse.ok = false;
						mockResponse.status = 400;
						mockResponse.url = 'mock-url';
						await fetchErrorHandler(mockResponse);
						assert.fail('Unreachable: function above should error before this');
					} catch (error) {
						assert.ok(error instanceof Error);
						assert.strictEqual(
							error.message,
							'The upstream service at "unknown" responded with a 400 status'
						);
					}
				});
			});
		});

		describe('fetchErrorHandler(response) with a response that has a body and clone method available', () => {
			describe('when `response.ok` is false and the reponse has a json format', () => {
				it('rejects with an error that contains the body of the response', async () => {
					const mockResponse = {
						ok: false,
						status: 400,
						url: 'https://mock.com/example',
						body: { error: 'bad bad not good' },
						headers: {
							get: mock.fn(() => 'application/json')
						},
						clone: mock.fn(() => mockResponse),
						text: mock.fn(() => JSON.stringify(mockResponse.body)),
						json: mock.fn(() => mockResponse.body)
					};
					try {
						await fetchErrorHandler(mockResponse);
						assert.fail('Unreachable: function above should error before this');
					} catch (error) {
						assert.ok(error instanceof Error);
						assert.strictEqual(
							error.message,
							'The upstream service at "mock.com" responded with a 400 status'
						);
						assert.partialDeepStrictEqual(Object.assign({}, error), {
							code: 'FETCH_CLIENT_ERROR',
							statusCode: 500,
							relatesToSystems: [],
							data: {
								upstreamUrl: 'https://mock.com/example',
								upstreamStatusCode: 400,
								responseBody: { error: 'bad bad not good' }
							}
						});
					}
				});
			});

			describe('when `response.ok` is false and the reponse has not a json format', () => {
				it('rejects with an error that contains the body of the response', async () => {
					const mockResponse = {
						ok: false,
						status: 400,
						url: 'https://mock.com/example',
						body: 'bad bad not good',
						headers: {
							get: mock.fn()
						},
						clone: mock.fn(() => mockResponse),
						text: mock.fn(() => JSON.stringify(mockResponse.body))
					};
					try {
						await fetchErrorHandler(mockResponse);
						assert.fail('Unreachable: function above should error before this');
					} catch (error) {
						assert.ok(error instanceof Error);
						assert.strictEqual(
							error.message,
							'The upstream service at "mock.com" responded with a 400 status'
						);
						assert.partialDeepStrictEqual(Object.assign({}, error), {
							code: 'FETCH_CLIENT_ERROR',
							statusCode: 500,
							relatesToSystems: [],
							data: {
								upstreamUrl: 'https://mock.com/example',
								upstreamStatusCode: 400,
								responseBody: '"bad bad not good"'
							}
						});
					}
				});
			});

			describe('when `response.ok` is false and the reponse body exceeds the max number of characters', () => {
				it('rejects with an error that contains the body of the response', async () => {
					const superLongString = Array(2000).fill('a').join('');
					const expectedMissingBit = `<span>I will be truncated</span>`;
					const mockResponse = {
						ok: false,
						status: 400,
						url: 'https://mock.com/example',
						body: `<html>
							<div>${superLongString}</div>
							${expectedMissingBit}
						</html>`,
						headers: {
							get: mock.fn()
						},
						clone: mock.fn(() => mockResponse),
						text: mock.fn(() => JSON.stringify(mockResponse.body))
					};
					try {
						await fetchErrorHandler(mockResponse);
						assert.fail('Unreachable: function above should error before this');
					} catch (error) {
						assert.ok(error instanceof Error);
						assert.strictEqual(error.data.responseBody.length, 2000);
						assert.strictEqual(
							error.data.responseBody.includes(expectedMissingBit),
							false
						);
					}
				});
			});

			describe('when `response.ok` is true but the body is a malformed JSON', () => {
				it('rejects with an error that contains the body of the response and the JSON error', async () => {
					const malformedBody = '{"message":"hello","issue":"missing comma"';
					const mockResponse = {
						ok: true,
						status: 200,
						url: 'https://mock.com/example',
						headers: {
							get: mock.fn(() => 'application/json')
						},
						body: malformedBody,
						clone: mock.fn(() => mockResponse),
						text: mock.fn(() => mockResponse.body),
						json: mock.fn(async () => malformedBody)
					};
					try {
						await fetchErrorHandler(mockResponse);
						assert.fail('Unreachable: function above should error before this');
					} catch (error) {
						assert.ok(error instanceof Error);
						assert.strictEqual(error.name, 'UpstreamServiceError');
						assert.partialDeepStrictEqual(Object.assign({}, error), {
							code: 'FETCH_INVALID_JSON_ERROR',
							statusCode: 502,
							relatesToSystems: [],
							data: {
								upstreamUrl: 'https://mock.com/example',
								upstreamStatusCode: 200,
								responseBody: '{"message":"hello","issue":"missing comma"'
							}
						});
						assert.match(
							error.data.upstreamErrorMessage,
							/expected ',' or '}' after property value in json/i
						);
					}
				});
			});

			describe('when `response.text()` throws an AbortError exception', () => {
				it('rejects with an augmented error', async () => {
					const mockError = Object.assign(new Error('mock abort error'), {
						name: 'AbortError'
					});

					const mockResponse = {
						ok: true,
						status: 200,
						url: 'https://mock.com/example',
						headers: {
							get: mock.fn(() => 'application/json')
						},
						clone: mock.fn(() => mockResponse),
						text: mock.fn(async () => {
							throw mockError;
						})
					};
					try {
						await fetchErrorHandler(mockResponse);
						assert.fail('Unreachable: function above should error before this');
					} catch (error) {
						assert.ok(error instanceof Error);
						assert.strictEqual(error.name, 'OperationalError');
						assert.strictEqual(error.code, 'FETCH_BODY_ABORT_ERROR');
						assert.strictEqual(error.cause, mockError);
					}
				});
			});

			describe('when `response.text()` throws an TypeError exception', () => {
				it('rejects with an augmented error', async () => {
					const mockResponse = {
						ok: true,
						status: 200,
						url: 'https://mock.com/example',
						headers: {
							get: mock.fn(() => 'application/json')
						},
						clone: mock.fn(() => mockResponse),
						text: mock.fn(async () => {
							throw new TypeError('mock body lock');
						})
					};
					try {
						await fetchErrorHandler(mockResponse);
						assert.fail('Unreachable: function above should error before this');
					} catch (error) {
						assert.ok(error instanceof Error);
						assert.strictEqual(error.name, 'OperationalError');
						assert.strictEqual(error.code, 'FETCH_BODY_TYPE_ERROR');
						assert.strictEqual(error.cause.message, 'mock body lock');
					}
				});
			});

			describe('when `response.text()` throws an unknown exception', () => {
				it('rejects with the original error', async () => {
					const mockResponse = {
						ok: true,
						status: 200,
						url: 'https://mock.com/example',
						headers: {
							get: mock.fn(() => 'application/json')
						},
						clone: mock.fn(() => mockResponse),
						text: mock.fn(async () => {
							throw new Error('unknown error');
						})
					};
					try {
						await fetchErrorHandler(mockResponse);
						assert.fail('Unreachable: function above should error before this');
					} catch (error) {
						assert.ok(error instanceof Error);
						assert.strictEqual(error.name, 'Error');
					}
				});
			});
		});

		describe('fetchErrorHandler(responsePromise)', () => {
			let mockError;
			let mockResponse;
			let resolvedValue;

			beforeEach(async () => {
				mockResponse = {
					ok: true,
					status: 200,
					url: 'https://mock.com/example',
					body: {}
				};
				resolvedValue = await fetchErrorHandler(Promise.resolve(mockResponse));
			});

			it('resolves with the response object', () => {
				assert.strictEqual(resolvedValue, mockResponse);
			});

			describe('when `response.ok` is `false` and `response.status` is 304', () => {
				it('resolves with the response object', async () => {
					mockResponse.ok = false;
					mockResponse.status = 304;
					resolvedValue = await fetchErrorHandler(mockResponse);
					assert.strictEqual(resolvedValue, mockResponse);
				});
			});

			describe('when `response.ok` is `false` and `response.status` is >= 400', () => {
				it('rejects with an error', async () => {
					try {
						mockResponse.ok = false;
						mockResponse.status = 400;
						await fetchErrorHandler(Promise.resolve(mockResponse));
						assert.fail('Unreachable: function above should error before this');
					} catch (error) {
						assert.ok(error instanceof Error);
					}
				});

				describe('when the response body has a pipe method (node-fetch)', () => {
					it('pipes the body into a stream that voids the body data', async () => {
						try {
							mockResponse.ok = false;
							mockResponse.status = 400;
							mockResponse.body.pipe = mock.fn();
							await fetchErrorHandler(Promise.resolve(mockResponse));
							assert.fail('Unreachable: function above should error before this');
						} catch (_) {
							assert.strictEqual(mockResponse.body.pipe.mock.callCount(), 1);
							const stream = mockResponse.body.pipe.mock.calls[0].arguments[0];
							assert.ok(stream instanceof Writable);
							assert.strictEqual(typeof stream._write, 'function');

							// We make sure the _write function doesn't do anything with
							// any of the data aside from calling `done`
							const chunk = {}; // The test will error if we try to call any chunk methods, e.g. toString
							const encoding = {}; // The test will error if we try to perform string operations on the encoding
							const done = mock.fn();
							stream._write(chunk, encoding, done);
							assert.strictEqual(done.mock.callCount(), 1);
							assert.deepStrictEqual(done.mock.calls[0].arguments, []);
						}
					});
				});
			});

			describe('when the promise rejects', () => {
				it('rejects with an error', async () => {
					try {
						mockError = new Error('mock fetch error');
						await fetchErrorHandler(Promise.reject(mockError));
						assert.fail('Unreachable: function above should error before this');
					} catch (error) {
						assert.strictEqual(error, mockError);
					}
				});
			});

			describe('when the promise rejects with a DNS error', () => {
				it('rejects with an augmented error', async () => {
					try {
						mockError = Object.assign(new Error('mock DNS error'), {
							code: 'ENOTFOUND'
						});
						await fetchErrorHandler(Promise.reject(mockError));
						assert.fail('Unreachable: function above should error before this');
					} catch (error) {
						assert.strictEqual(error.name, 'OperationalError');
						assert.strictEqual(error.code, 'FETCH_DNS_LOOKUP_ERROR');
						assert.strictEqual(error.message, 'Cound not resolve DNS entry');
						assert.strictEqual(error.cause, mockError);
					}
				});
			});

			describe('when the promise rejects with a DNS error that has a hostname', () => {
				it('rejects with an augmented error', async () => {
					try {
						mockError = Object.assign(new Error('mock DNS error'), {
							code: 'ENOTFOUND',
							hostname: 'mockhost'
						});
						await fetchErrorHandler(Promise.reject(mockError));
						assert.fail('Unreachable: function above should error before this');
					} catch (error) {
						assert.strictEqual(
							error.message,
							'Cound not resolve DNS entry for host mockhost'
						);
					}
				});
			});

			describe('when the promise rejects with an error that has a DNS error as the cause', () => {
				it('rejects with an augmented error', async () => {
					try {
						mockError = Object.assign(new Error('mock outer error'), {
							cause: Object.assign(new Error('mock DNS error'), {
								code: 'ENOTFOUND',
								hostname: 'mockhost'
							})
						});
						await fetchErrorHandler(Promise.reject(mockError));
						assert.fail('Unreachable: function above should error before this');
					} catch (error) {
						assert.strictEqual(error.name, 'OperationalError');
						assert.strictEqual(error.code, 'FETCH_DNS_LOOKUP_ERROR');
						assert.strictEqual(
							error.message,
							'Cound not resolve DNS entry for host mockhost'
						);
						assert.strictEqual(error.cause, mockError);
					}
				});
			});

			describe('when the promise rejects with an abort error', () => {
				it('rejects with an augmented error', async () => {
					try {
						mockError = Object.assign(new Error('mock abort error'), {
							name: 'AbortError'
						});
						await fetchErrorHandler(Promise.reject(mockError));
						assert.fail('Unreachable: function above should error before this');
					} catch (error) {
						assert.strictEqual(error.name, 'OperationalError');
						assert.strictEqual(error.code, 'FETCH_ABORT_ERROR');
						assert.strictEqual(error.cause, mockError);
					}
				});
			});

			describe('when the promise rejects with a timeout error', () => {
				it('rejects with an augmented error', async () => {
					try {
						mockError = Object.assign(new Error('mock timeout error'), {
							name: 'TimeoutError'
						});
						await fetchErrorHandler(Promise.reject(mockError));
						assert.fail('Unreachable: function above should error before this');
					} catch (error) {
						assert.strictEqual(error.name, 'OperationalError');
						assert.strictEqual(error.code, 'FETCH_TIMEOUT_ERROR');
						assert.strictEqual(error.cause, mockError);
					}
				});
			});

			describe('when the promise rejects with a fetch request-timeout error', () => {
				it('rejects with an augmented error', async () => {
					try {
						mockError = Object.assign(new Error('mock timeout error'), {
							name: 'FetchError',
							type: 'request-timeout'
						});
						await fetchErrorHandler(Promise.reject(mockError));
						assert.fail('Unreachable: function above should error before this');
					} catch (error) {
						assert.strictEqual(error.name, 'OperationalError');
						assert.strictEqual(error.code, 'FETCH_TIMEOUT_ERROR');
						assert.strictEqual(error.cause, mockError);
					}
				});
			});

			describe('when the promise rejects with a socket error', () => {
				it('rejects with an augmented error', async () => {
					try {
						mockError = Object.assign(new Error('mock socket error'), {
							code: 'ECONNRESET'
						});
						await fetchErrorHandler(Promise.reject(mockError));
						assert.fail('Unreachable: function above should error before this');
					} catch (error) {
						assert.strictEqual(error.name, 'UpstreamServiceError');
						assert.strictEqual(error.code, 'FETCH_SOCKET_HANGUP_ERROR');
						assert.strictEqual(error.cause, mockError);
					}
				});
			});

			describe('when the promise rejects with a socket error as the cause', () => {
				it('rejects with an augmented error', async () => {
					try {
						mockError = Object.assign(new Error('mock error'), {
							cause: Object.assign(new Error('mock socket error'), {
								code: 'ECONNRESET'
							})
						});
						await fetchErrorHandler(Promise.reject(mockError));
						assert.fail('Unreachable: function above should error before this');
					} catch (error) {
						assert.strictEqual(error.name, 'UpstreamServiceError');
						assert.strictEqual(error.code, 'FETCH_SOCKET_HANGUP_ERROR');
						assert.strictEqual(error.cause, mockError);
					}
				});
			});

			describe('when the promise rejects with a SocketError instance as the cause', () => {
				it('rejects with an augmented error', async () => {
					try {
						mockError = Object.assign(new Error('mock error'), {
							cause: Object.assign(new Error('mock socket error'), {
								name: 'SocketError'
							})
						});
						await fetchErrorHandler(Promise.reject(mockError));
						assert.fail('Unreachable: function above should error before this');
					} catch (error) {
						assert.strictEqual(error.name, 'UpstreamServiceError');
						assert.strictEqual(error.code, 'FETCH_SOCKET_HANGUP_ERROR');
						assert.strictEqual(error.cause, mockError);
					}
				});
			});
		});

		describe('fetchErrorHandler(nonResponse)', () => {
			describe('when nonResponse is a non-object', () => {
				it('rejects with an error', async () => {
					try {
						await fetchErrorHandler(null);
						assert.fail('Unreachable: function above should error before this');
					} catch (error) {
						assert.ok(error instanceof TypeError);
						assert.strictEqual(error.code, 'FETCH_ERROR_HANDLER_INVALID_INPUT');
					}
				});
			});

			describe('when nonResponse has a non-boolean `ok` property', () => {
				it('rejects with an error', async () => {
					try {
						await fetchErrorHandler({
							ok: 'nope',
							status: 400
						});
						assert.fail('Unreachable: function above should error before this');
					} catch (error) {
						assert.ok(error instanceof TypeError);
						assert.strictEqual(error.code, 'FETCH_ERROR_HANDLER_INVALID_INPUT');
					}
				});
			});

			describe('when nonResponse has a non-number `status` property', () => {
				it('rejects with an error', async () => {
					try {
						await fetchErrorHandler({
							ok: false,
							status: '400'
						});
						assert.fail('Unreachable: function above should error before this');
					} catch (error) {
						assert.ok(error instanceof TypeError);
						assert.strictEqual(error.code, 'FETCH_ERROR_HANDLER_INVALID_INPUT');
					}
				});
			});
		});
	});

	describe('createFetchErrorHandler(options)', () => {
		describe('when `options.upstreamSystemCode` is set', () => {
			beforeEach(() => {
				fetchErrorHandler = createFetchErrorHandler({
					upstreamSystemCode: 'mock-system'
				});
			});

			describe('fetchErrorHandler(response)', () => {
				describe('when `response.ok` is `false` and `response.status` is >= 400', () => {
					it('rejects with an error that includes the upstream system code', async () => {
						try {
							await fetchErrorHandler({
								ok: false,
								status: 400,
								body: {}
							});
							assert.fail('Unreachable: function above should error before this');
						} catch (error) {
							assert.ok(error instanceof Error);
							assert.deepStrictEqual(error.relatesToSystems, ['mock-system']);
						}
					});
				});
			});
		});
	});
});
