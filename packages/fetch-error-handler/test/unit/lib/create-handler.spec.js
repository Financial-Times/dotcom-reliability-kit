jest.mock('node:stream');

const createFetchErrorHandler = require('../../../lib/create-handler');
const { Writable } = require('node:stream');

describe('@dotcom-reliability-kit/fetch-error-handler/lib/create-handler', () => {
	let fetchErrorHandler;

	describe('createFetchErrorHandler()', () => {
		beforeEach(() => {
			fetchErrorHandler = createFetchErrorHandler();
		});

		it('returns a handler function', () => {
			expect(fetchErrorHandler).toBeInstanceOf(Function);
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
				expect(resolvedValue).toStrictEqual(mockResponse);
			});

			describe('when `response.ok` is `false` and `response.status` is 304', () => {
				it('resolves with the response object', async () => {
					mockResponse.ok = false;
					mockResponse.status = 304;
					resolvedValue = await fetchErrorHandler(mockResponse);
					expect(resolvedValue).toStrictEqual(mockResponse);
				});
			});

			describe('when `response.ok` is `false` and `response.status` is 400', () => {
				it('rejects with an error describing the issue', async () => {
					expect.assertions(3);
					try {
						mockResponse.ok = false;
						mockResponse.status = 400;
						await fetchErrorHandler(mockResponse);
					} catch (error) {
						expect(error).toBeInstanceOf(Error);
						expect(error.message).toStrictEqual(
							'The upstream service at "mock.com" responded with a 400 status'
						);
						expect(error).toMatchObject({
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
					expect.assertions(3);
					try {
						mockResponse.ok = false;
						mockResponse.status = 500;
						await fetchErrorHandler(mockResponse);
					} catch (error) {
						expect(error).toBeInstanceOf(Error);
						expect(error.message).toStrictEqual(
							'The upstream service at "mock.com" responded with a 500 status'
						);
						expect(error).toMatchObject({
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
					expect.assertions(3);
					try {
						mockResponse.ok = false;
						mockResponse.status = 600;
						await fetchErrorHandler(mockResponse);
					} catch (error) {
						expect(error).toBeInstanceOf(Error);
						expect(error.message).toStrictEqual(
							'The upstream service at "mock.com" responded with a 600 status'
						);
						expect(error).toMatchObject({
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
					expect.assertions(2);
					try {
						mockResponse.ok = false;
						mockResponse.status = 400;
						mockResponse.url = null;
						await fetchErrorHandler(mockResponse);
					} catch (error) {
						expect(error).toBeInstanceOf(Error);
						expect(error.message).toStrictEqual(
							'The upstream service at "unknown" responded with a 400 status'
						);
					}
				});
			});

			describe('when `response.ok` is `false` and `response.url` is a string but is not a valid URL', () => {
				it('uses "unknown" in the error message rather than a hostname', async () => {
					expect.assertions(2);
					try {
						mockResponse.ok = false;
						mockResponse.status = 400;
						mockResponse.url = 'mock-url';
						await fetchErrorHandler(mockResponse);
					} catch (error) {
						expect(error).toBeInstanceOf(Error);
						expect(error.message).toStrictEqual(
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
							get: jest.fn(() => 'application/json')
						},
						clone: jest.fn(() => mockResponse),
						json: jest.fn(() => mockResponse.body)
					};
					expect.assertions(3);
					try {
						await fetchErrorHandler(mockResponse);
					} catch (error) {
						expect(error).toBeInstanceOf(Error);
						expect(error.message).toStrictEqual(
							'The upstream service at "mock.com" responded with a 400 status'
						);
						expect(error).toMatchObject({
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
							get: jest.fn()
						},
						clone: jest.fn(() => mockResponse),
						text: jest.fn(() => JSON.stringify(mockResponse.body))
					};
					expect.assertions(3);
					try {
						await fetchErrorHandler(mockResponse);
					} catch (error) {
						expect(error).toBeInstanceOf(Error);
						expect(error.message).toStrictEqual(
							'The upstream service at "mock.com" responded with a 400 status'
						);
						expect(error).toMatchObject({
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
							get: jest.fn()
						},
						clone: jest.fn(() => mockResponse),
						text: jest.fn(() => JSON.stringify(mockResponse.body))
					};
					expect.assertions(3);
					try {
						await fetchErrorHandler(mockResponse);
					} catch (error) {
						expect(error).toBeInstanceOf(Error);
						expect(error.data.responseBody.length).toEqual(2000);
						expect(error.data.responseBody.includes(expectedMissingBit)).toBe(
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
							get: jest.fn(() => 'application/json')
						},
						clone: jest.fn(() => mockResponse),
						json: jest.fn().mockResolvedValue(malformedBody)
					};
					expect.assertions(3);
					try {
						await fetchErrorHandler(mockResponse);
					} catch (error) {
						expect(error).toBeInstanceOf(Error);
						expect(error.name).toStrictEqual('UpstreamServiceError');
						expect(error).toMatchObject({
							code: 'INVALID_JSON_ERROR',
							statusCode: 502,
							relatesToSystems: [],
							data: {
								upstreamUrl: 'https://mock.com/example',
								upstreamStatusCode: 200,
								responseBody: '{"message":"hello","issue":"missing comma"',
								upstreamErrorMessage: expect.stringContaining(
									"Expected ',' or '}' after property value in JSON"
								)
							}
						});
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
				expect(resolvedValue).toStrictEqual(mockResponse);
			});

			describe('when `response.ok` is `false` and `response.status` is 304', () => {
				it('resolves with the response object', async () => {
					mockResponse.ok = false;
					mockResponse.status = 304;
					resolvedValue = await fetchErrorHandler(mockResponse);
					expect(resolvedValue).toStrictEqual(mockResponse);
				});
			});

			describe('when `response.ok` is `false` and `response.status` is >= 400', () => {
				it('rejects with an error', async () => {
					expect.assertions(1);
					try {
						mockResponse.ok = false;
						mockResponse.status = 400;
						await fetchErrorHandler(Promise.resolve(mockResponse));
					} catch (error) {
						expect(error).toBeInstanceOf(Error);
					}
				});

				describe('when the response body has a pipe method (node-fetch)', () => {
					it('pipes the body into a stream that voids the body data', async () => {
						expect.assertions(5);
						try {
							mockResponse.ok = false;
							mockResponse.status = 400;
							mockResponse.body.pipe = jest.fn();
							await fetchErrorHandler(Promise.resolve(mockResponse));
						} catch (error) {
							expect(mockResponse.body.pipe).toHaveBeenCalledTimes(1);
							expect(mockResponse.body.pipe).toHaveBeenCalledWith(
								expect.any(Writable)
							);
							const stream = mockResponse.body.pipe.mock.calls[0][0];
							expect(typeof stream._write).toEqual('function');

							// We make sure the _write function doesn't do anything with
							// any of the data aside from calling `done`
							const chunk = {}; // The test will error if we try to call any chunk methods, e.g. toString
							const encoding = {}; // The test will error if we try to perform string operations on the encoding
							const done = jest.fn();
							stream._write(chunk, encoding, done);
							expect(done).toHaveBeenCalledTimes(1);
							expect(done).toHaveBeenCalledWith();
						}
					});
				});
			});

			describe('when the promise rejects', () => {
				it('rejects with an error', async () => {
					expect.assertions(1);
					try {
						mockError = new Error('mock fetch error');
						await fetchErrorHandler(Promise.reject(mockError));
					} catch (error) {
						expect(error).toStrictEqual(mockError);
					}
				});
			});

			describe('when the promise rejects with a DNS error', () => {
				it('rejects with an augmented error', async () => {
					expect.hasAssertions();
					try {
						mockError = Object.assign(new Error('mock DNS error'), {
							code: 'ENOTFOUND'
						});
						await fetchErrorHandler(Promise.reject(mockError));
					} catch (error) {
						expect(error.name).toStrictEqual('OperationalError');
						expect(error.code).toStrictEqual('FETCH_DNS_LOOKUP_ERROR');
						expect(error.message).toStrictEqual('Cound not resolve DNS entry');
						expect(error.cause).toStrictEqual(mockError);
					}
				});
			});

			describe('when the promise rejects with a DNS error that has a hostname', () => {
				it('rejects with an augmented error', async () => {
					expect.hasAssertions();
					try {
						mockError = Object.assign(new Error('mock DNS error'), {
							code: 'ENOTFOUND',
							hostname: 'mockhost'
						});
						await fetchErrorHandler(Promise.reject(mockError));
					} catch (error) {
						expect(error.message).toStrictEqual(
							'Cound not resolve DNS entry for host mockhost'
						);
					}
				});
			});

			describe('when the promise rejects with an error that has a DNS error as the cause', () => {
				it('rejects with an augmented error', async () => {
					expect.hasAssertions();
					try {
						mockError = Object.assign(new Error('mock outer error'), {
							cause: Object.assign(new Error('mock DNS error'), {
								code: 'ENOTFOUND',
								hostname: 'mockhost'
							})
						});
						await fetchErrorHandler(Promise.reject(mockError));
					} catch (error) {
						expect(error.name).toStrictEqual('OperationalError');
						expect(error.code).toStrictEqual('FETCH_DNS_LOOKUP_ERROR');
						expect(error.message).toStrictEqual(
							'Cound not resolve DNS entry for host mockhost'
						);
						expect(error.cause).toStrictEqual(mockError);
					}
				});
			});

			describe('when the promise rejects with an abort error', () => {
				it('rejects with an augmented error', async () => {
					expect.hasAssertions();
					try {
						mockError = Object.assign(new Error('mock abort error'), {
							name: 'AbortError'
						});
						await fetchErrorHandler(Promise.reject(mockError));
					} catch (error) {
						expect(error.name).toStrictEqual('OperationalError');
						expect(error.code).toStrictEqual('FETCH_ABORT_ERROR');
						expect(error.cause).toStrictEqual(mockError);
					}
				});
			});

			describe('when the promise rejects with a timeout error', () => {
				it('rejects with an augmented error', async () => {
					expect.hasAssertions();
					try {
						mockError = Object.assign(new Error('mock timeout error'), {
							name: 'TimeoutError'
						});
						await fetchErrorHandler(Promise.reject(mockError));
					} catch (error) {
						expect(error.name).toStrictEqual('OperationalError');
						expect(error.code).toStrictEqual('FETCH_TIMEOUT_ERROR');
						expect(error.cause).toStrictEqual(mockError);
					}
				});
			});

			describe('when the promise rejects with a fetch request-timeout error', () => {
				it('rejects with an augmented error', async () => {
					expect.hasAssertions();
					try {
						mockError = Object.assign(new Error('mock timeout error'), {
							name: 'FetchError',
							type: 'request-timeout'
						});
						await fetchErrorHandler(Promise.reject(mockError));
					} catch (error) {
						expect(error.name).toStrictEqual('OperationalError');
						expect(error.code).toStrictEqual('FETCH_TIMEOUT_ERROR');
						expect(error.cause).toStrictEqual(mockError);
					}
				});
			});

			describe('when the promise rejects with a socket error', () => {
				it('rejects with an augmented error', async () => {
					expect.hasAssertions();
					try {
						mockError = Object.assign(new Error('mock socket error'), {
							code: 'ECONNRESET'
						});
						await fetchErrorHandler(Promise.reject(mockError));
					} catch (error) {
						expect(error.name).toStrictEqual('UpstreamServiceError');
						expect(error.code).toStrictEqual('FETCH_SOCKET_HANGUP_ERROR');
						expect(error.cause).toStrictEqual(mockError);
					}
				});
			});

			describe('when the promise rejects with a socket error as the cause', () => {
				it('rejects with an augmented error', async () => {
					expect.hasAssertions();
					try {
						mockError = Object.assign(new Error('mock error'), {
							cause: Object.assign(new Error('mock socket error'), {
								code: 'ECONNRESET'
							})
						});
						await fetchErrorHandler(Promise.reject(mockError));
					} catch (error) {
						expect(error.name).toStrictEqual('UpstreamServiceError');
						expect(error.code).toStrictEqual('FETCH_SOCKET_HANGUP_ERROR');
						expect(error.cause).toStrictEqual(mockError);
					}
				});
			});

			describe('when the promise rejects with a SocketError instance as the cause', () => {
				it('rejects with an augmented error', async () => {
					expect.hasAssertions();
					try {
						mockError = Object.assign(new Error('mock error'), {
							cause: Object.assign(new Error('mock socket error'), {
								name: 'SocketError'
							})
						});
						await fetchErrorHandler(Promise.reject(mockError));
					} catch (error) {
						expect(error.name).toStrictEqual('UpstreamServiceError');
						expect(error.code).toStrictEqual('FETCH_SOCKET_HANGUP_ERROR');
						expect(error.cause).toStrictEqual(mockError);
					}
				});
			});
		});

		describe('fetchErrorHandler(nonResponse)', () => {
			describe('when nonResponse is a non-object', () => {
				it('rejects with an error', async () => {
					expect.assertions(2);
					try {
						await fetchErrorHandler(null);
					} catch (error) {
						expect(error).toBeInstanceOf(TypeError);
						expect(error.code).toStrictEqual(
							'FETCH_ERROR_HANDLER_INVALID_INPUT'
						);
					}
				});
			});

			describe('when nonResponse has a non-boolean `ok` property', () => {
				it('rejects with an error', async () => {
					expect.assertions(2);
					try {
						await fetchErrorHandler({
							ok: 'nope',
							status: 400
						});
					} catch (error) {
						expect(error).toBeInstanceOf(TypeError);
						expect(error.code).toStrictEqual(
							'FETCH_ERROR_HANDLER_INVALID_INPUT'
						);
					}
				});
			});

			describe('when nonResponse has a non-number `status` property', () => {
				it('rejects with an error', async () => {
					expect.assertions(2);
					try {
						await fetchErrorHandler({
							ok: false,
							status: '400'
						});
					} catch (error) {
						expect(error).toBeInstanceOf(TypeError);
						expect(error.code).toStrictEqual(
							'FETCH_ERROR_HANDLER_INVALID_INPUT'
						);
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
						expect.assertions(2);
						try {
							await fetchErrorHandler({
								ok: false,
								status: 400,
								body: {}
							});
						} catch (error) {
							expect(error).toBeInstanceOf(Error);
							expect(error.relatesToSystems).toEqual(['mock-system']);
						}
					});
				});
			});
		});
	});
});
