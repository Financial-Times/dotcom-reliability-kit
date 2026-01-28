const { after, before, describe, it } = require('node:test');
const assert = require('node:assert/strict');

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
const { handleFetchErrors } = require('@dotcom-reliability-kit/fetch-error-handler');

describe('@dotcom-reliability-kit/fetch-error-handler end-to-end', () => {
	let child;
	let baseUrl;

	// Set up the test app
	before((_, done) => {
		child = fork(`${__dirname}/fixtures/app.js`, { stdio: 'pipe' });
		child.on('message', (message) => {
			if (message?.ready) {
				baseUrl = `http://localhost:${message.port}`;
				done();
			}
		});
	});

	after(() => {
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
					try {
						await handleFetchErrors(fetch(`${baseUrl}/status/400`));
						assert.fail('Unreachable: function above should error before this');
					} catch (error) {
						assert.strictEqual(error.name, 'HttpError');
						assert.strictEqual(error.code, 'FETCH_CLIENT_ERROR');
						assert.strictEqual(error.statusCode, 500);
						assert.strictEqual(error.data.responseBody, 'Bad Request');
					}
				});

				it('handles 404 errors', async () => {
					try {
						await handleFetchErrors(fetch(`${baseUrl}/status/404`));
						assert.fail('Unreachable: function above should error before this');
					} catch (error) {
						assert.strictEqual(error.name, 'HttpError');
						assert.strictEqual(error.code, 'FETCH_CLIENT_ERROR');
						assert.strictEqual(error.statusCode, 500);
						assert.strictEqual(error.data.responseBody, 'Not Found');
					}
				});

				it('handles 500 errors', async () => {
					try {
						await handleFetchErrors(fetch(`${baseUrl}/status/500`));
						assert.fail('Unreachable: function above should error before this');
					} catch (error) {
						assert.strictEqual(error.name, 'UpstreamServiceError');
						assert.strictEqual(error.code, 'FETCH_SERVER_ERROR');
						assert.strictEqual(error.statusCode, 502);
						assert.strictEqual(error.data.responseBody, 'Internal Server Error');
					}
				});

				it('handles 503 errors', async () => {
					try {
						await handleFetchErrors(fetch(`${baseUrl}/status/503`));
						assert.fail('Unreachable: function above should error before this');
					} catch (error) {
						assert.strictEqual(error.name, 'UpstreamServiceError');
						assert.strictEqual(error.code, 'FETCH_SERVER_ERROR');
						assert.strictEqual(error.statusCode, 502);
						assert.strictEqual(error.data.responseBody, 'Service Unavailable');
					}
				});

				it('handles nonexistent domains', async () => {
					try {
						await handleFetchErrors(fetch('https://www.ft.not-a-tld'));
						assert.fail('Unreachable: function above should error before this');
					} catch (error) {
						assert.strictEqual(error.name, 'OperationalError');
						assert.strictEqual(error.code, 'FETCH_DNS_LOOKUP_ERROR');
					}
				});

				it('handles socket hangups', async () => {
					try {
						await handleFetchErrors(fetch(`${baseUrl}/hangup`));
						assert.fail('Unreachable: function above should error before this');
					} catch (error) {
						assert.strictEqual(error.name, 'UpstreamServiceError');
						assert.strictEqual(error.code, 'FETCH_SOCKET_HANGUP_ERROR');
						assert.strictEqual(error.statusCode, 502);
					}
				});

				if (supportsAbortSignal) {
					it('handles timeout errors via AbortController', async () => {
						try {
							await handleFetchErrors(
								fetch(`${baseUrl}/status/200`, {
									signal: AbortSignal.timeout(10)
								})
							);
							assert.fail('Unreachable: function above should error before this');
						} catch (error) {
							assert.strictEqual(error.name, 'OperationalError');
							// This error is different depending on whether we're using
							// Undici/native fetch vs node-fetch. That's why we have
							// multiple potential codes here
							assert.ok(
								['FETCH_ABORT_ERROR', 'FETCH_TIMEOUT_ERROR'].includes(error.code)
							);
						}
					});
				}

				if (supportsNonStandardTimeoutOption) {
					it('handles timeout errors via the non-standard timeout option', async () => {
						try {
							await handleFetchErrors(
								fetch(`${baseUrl}/status/200`, { timeout: 10 })
							);
							assert.fail('Unreachable: function above should error before this');
						} catch (error) {
							assert.strictEqual(error.name, 'OperationalError');
							assert.strictEqual(error.code, 'FETCH_TIMEOUT_ERROR');
						}
					});
				}

				it('handles 200 response with malformed JSON body', async () => {
					try {
						await handleFetchErrors(fetch(`${baseUrl}/body/json/invalid`));
						assert.fail('Unreachable: function above should error before this');
					} catch (error) {
						assert.strictEqual(error.name, 'UpstreamServiceError');
						assert.strictEqual(error.code, 'FETCH_INVALID_JSON_ERROR');
						assert.strictEqual(error.statusCode, 502);
						assert.strictEqual(error.data.responseBody, '{json:');
						assert.match(
							error.data.upstreamErrorMessage,
							/expected property name or '}' in json at position 1/i
						);
					}
				});

				it('handles errors with correct JSON body', async () => {
					try {
						await handleFetchErrors(fetch(`${baseUrl}/body/json/valid`));
						assert.fail('Unreachable: function above should error before this');
					} catch (error) {
						assert.strictEqual(error.name, 'UpstreamServiceError');
						assert.strictEqual(error.code, 'FETCH_SERVER_ERROR');
						assert.strictEqual(error.statusCode, 502);
						assert.deepStrictEqual(error.data.responseBody, { json: true });
						assert.strictEqual(error.data.upstreamErrorMessage, undefined);
					}
				});

				it('handles cases when the body error is too long', async () => {
					try {
						await handleFetchErrors(fetch(`${baseUrl}/body/text/long`));
						assert.fail('Unreachable: function above should error before this');
					} catch (error) {
						assert.strictEqual(error.name, 'UpstreamServiceError');
						assert.strictEqual(error.code, 'FETCH_SERVER_ERROR');
						assert.strictEqual(error.statusCode, 502);
						assert.match(error.data.responseBody, /a/);
						assert.strictEqual(error.data.responseBody.length, 2000);
					}
				});

				if (supportsDecodingError) {
					it('handles cases when there is an issue with .text() method', async () => {
						try {
							await handleFetchErrors(fetch(`${baseUrl}/body/text/invalid`));
							assert.fail('Unreachable: function above should error before this');
						} catch (error) {
							assert.strictEqual(error.name, 'OperationalError');
							assert.strictEqual(error.code, 'FETCH_BODY_TYPE_ERROR');
							assert.strictEqual(error.cause.name, 'TypeError');
							assert.strictEqual(error.cause.message, 'terminated');
							assert.strictEqual(error.cause.cause.message, 'incorrect header check');
						}
					});
				}
			});
		}
	}
});
