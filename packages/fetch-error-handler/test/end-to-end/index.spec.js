const fetchImplementations = [
	{
		name: 'node-fetch-1',
		fetch: require('node-fetch-1'),
		supportsAbortSignal: false,
		supportsNonStandardTimeoutOption: true,
		supportsDecodingError: false
	},
	{
		name: 'node-fetch-2',
		fetch: require('node-fetch-2'),
		supportsAbortSignal: true,
		supportsNonStandardTimeoutOption: true,
		supportsDecodingError: false
	},
	{
		name: 'undici',
		fetch: require('undici').fetch,
		supportsAbortSignal: true,
		supportsNonStandardTimeoutOption: false,
		supportsDecodingError: true
	},
	{
		name: 'native',
		fetch: global.fetch,
		supportsAbortSignal: true,
		supportsNonStandardTimeoutOption: false,
		supportsDecodingError: true
	}
];
const { fork } = require('node:child_process');
const { handleFetchErrors } = require('../..');

describe('@dotcom-reliability-kit/fetch-error-handler end-to-end', () => {
	let child;
	let baseUrl;

	// Set up the test app
	beforeAll((done) => {
		child = fork(`${__dirname}/fixtures/app.js`, { stdio: 'pipe' });
		child.on('message', (message) => {
			if (message?.ready) {
				baseUrl = `http://localhost:${message.port}`;
				done();
			}
		});
	});

	afterAll(() => {
		child.kill('SIGINT');
	});

	for (const {
		name,
		fetch,
		supportsAbortSignal,
		supportsNonStandardTimeoutOption,
		supportsDecodingError
	} of fetchImplementations) {
		if (typeof fetch === 'function') {
			describe(name, () => {
				it('handles 400 errors', async () => {
					expect.hasAssertions();
					try {
						await handleFetchErrors(fetch(`${baseUrl}/status/400`));
					} catch (error) {
						expect(error.name).toStrictEqual('HttpError');
						expect(error.code).toStrictEqual('FETCH_CLIENT_ERROR');
						expect(error.statusCode).toStrictEqual(500);
						expect(error.data.responseBody).toStrictEqual('Bad Request');
					}
				});

				it('handles 404 errors', async () => {
					expect.hasAssertions();
					try {
						await handleFetchErrors(fetch(`${baseUrl}/status/404`));
					} catch (error) {
						expect(error.name).toStrictEqual('HttpError');
						expect(error.code).toStrictEqual('FETCH_CLIENT_ERROR');
						expect(error.statusCode).toStrictEqual(500);
						expect(error.data.responseBody).toStrictEqual('Not Found');
					}
				});

				it('handles 500 errors', async () => {
					expect.hasAssertions();
					try {
						await handleFetchErrors(fetch(`${baseUrl}/status/500`));
					} catch (error) {
						expect(error.name).toStrictEqual('UpstreamServiceError');
						expect(error.code).toStrictEqual('FETCH_SERVER_ERROR');
						expect(error.statusCode).toStrictEqual(502);
						expect(error.data.responseBody).toStrictEqual(
							'Internal Server Error'
						);
					}
				});

				it('handles 503 errors', async () => {
					expect.hasAssertions();
					try {
						await handleFetchErrors(fetch(`${baseUrl}/status/503`));
					} catch (error) {
						expect(error.name).toStrictEqual('UpstreamServiceError');
						expect(error.code).toStrictEqual('FETCH_SERVER_ERROR');
						expect(error.statusCode).toStrictEqual(502);
						expect(error.data.responseBody).toStrictEqual(
							'Service Unavailable'
						);
					}
				});

				it('handles nonexistent domains', async () => {
					expect.hasAssertions();
					try {
						await handleFetchErrors(fetch('https://www.ft.not-a-tld'));
					} catch (error) {
						expect(error.name).toStrictEqual('OperationalError');
						expect(error.code).toStrictEqual('FETCH_DNS_LOOKUP_ERROR');
					}
				});

				it('handles socket hangups', async () => {
					expect.hasAssertions();
					try {
						await handleFetchErrors(fetch(`${baseUrl}/hangup`));
					} catch (error) {
						expect(error.name).toStrictEqual('UpstreamServiceError');
						expect(error.code).toStrictEqual('FETCH_SOCKET_HANGUP_ERROR');
						expect(error.statusCode).toStrictEqual(502);
					}
				});

				if (supportsAbortSignal) {
					it('handles timeout errors via AbortController', async () => {
						expect.hasAssertions();
						try {
							await handleFetchErrors(
								fetch(`${baseUrl}/status/200`, {
									signal: AbortSignal.timeout(10)
								})
							);
						} catch (error) {
							expect(error.name).toStrictEqual('OperationalError');
							// This error is different depending on whether we're using
							// Undici/native fetch vs node-fetch. That's why we have
							// multiple potential codes here
							expect(['FETCH_ABORT_ERROR', 'FETCH_TIMEOUT_ERROR']).toContain(
								error.code
							);
						}
					});
				}

				if (supportsNonStandardTimeoutOption) {
					it('handles timeout errors via the non-standard timeout option', async () => {
						expect.hasAssertions();
						try {
							await handleFetchErrors(
								fetch(`${baseUrl}/status/200`, { timeout: 10 })
							);
						} catch (error) {
							expect(error.name).toStrictEqual('OperationalError');
							expect(error.code).toStrictEqual('FETCH_TIMEOUT_ERROR');
						}
					});
				}

				it('handles 200 response with malformed JSON body', async () => {
					expect.hasAssertions();
					try {
						await handleFetchErrors(fetch(`${baseUrl}/body/json/invalid`));
					} catch (error) {
						expect(error.name).toStrictEqual('UpstreamServiceError');
						expect(error.code).toStrictEqual('FETCH_INVALID_JSON_ERROR');
						expect(error.statusCode).toStrictEqual(502);
						expect(error.data.responseBody).toStrictEqual('{json:');
						expect(error.data.upstreamErrorMessage).toEqual(
							expect.stringContaining(
								"Expected property name or '}' in JSON at position 1"
							)
						);
					}
				});

				it('handles errors with correct JSON body', async () => {
					expect.hasAssertions();
					try {
						await handleFetchErrors(fetch(`${baseUrl}/body/json/valid`));
					} catch (error) {
						expect(error.name).toStrictEqual('UpstreamServiceError');
						expect(error.code).toStrictEqual('FETCH_SERVER_ERROR');
						expect(error.statusCode).toStrictEqual(502);
						expect(error.data.responseBody).toStrictEqual({ json: true });
						expect(error.data.upstreamErrorMessage).toBeUndefined();
					}
				});

				it('handles cases when the body error is too long', async () => {
					expect.hasAssertions();
					try {
						await handleFetchErrors(fetch(`${baseUrl}/body/text/long`));
					} catch (error) {
						expect(error.name).toStrictEqual('UpstreamServiceError');
						expect(error.code).toStrictEqual('FETCH_SERVER_ERROR');
						expect(error.statusCode).toStrictEqual(502);
						expect(error.data.responseBody).toContain('a');
						expect(error.data.responseBody.length).toEqual(2000);
					}
				});

				if (supportsDecodingError) {
					it('handles cases when there is an issue with .text() method', async () => {
						expect.hasAssertions();
						try {
							await handleFetchErrors(fetch(`${baseUrl}/body/text/invalid`));
						} catch (error) {
							expect(error.name).toStrictEqual('OperationalError');
							expect(error.code).toStrictEqual('FETCH_BODY_TYPE_ERROR');
							expect(error.cause.name).toStrictEqual('TypeError');
							expect(error.cause.message).toStrictEqual('terminated');
							expect(error.cause.cause.message).toStrictEqual(
								'incorrect header check'
							);
						}
					});
				}
			});
		} else {
			// The fetch implementation is not available (e.g. native fetch).
			// TODO: this can be removed when we drop Node.js 16 support.
			it.skip(`${name}`, () => {});
		}
	}
});
