const createFetchErrorHandler = require('../../../lib/create-handler');

describe('@dotcom-reliability-kit/fetch-error-handler', () => {
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
					url: 'https://mock.com/example'
				};
				resolvedValue = await fetchErrorHandler(mockResponse);
			});

			it('resolves with the response object', () => {
				expect(resolvedValue).toStrictEqual(mockResponse);
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

		describe('fetchErrorHandler(responsePromise)', () => {
			let mockResponse;
			let resolvedValue;

			beforeEach(async () => {
				mockResponse = {
					ok: true,
					status: 200,
					url: 'https://mock.com/example'
				};
				resolvedValue = await fetchErrorHandler(Promise.resolve(mockResponse));
			});

			it('resolves with the response object', () => {
				expect(resolvedValue).toStrictEqual(mockResponse);
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
								status: 400
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
