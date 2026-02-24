const { before, beforeEach, describe, it, mock } = require('node:test');
const assert = require('node:assert/strict');

const getNodeAutoInstrumentations = mock.fn(() => 'mock-auto-instrumentations');
mock.module('@opentelemetry/auto-instrumentations-node', {
	namedExports: { getNodeAutoInstrumentations }
});

const logRecoverableError = mock.fn();
mock.module('@dotcom-reliability-kit/log-error', { namedExports: { logRecoverableError } });

const UserInputError = mock.fn(class UserInputError {});
mock.module('@dotcom-reliability-kit/errors', { namedExports: { UserInputError } });

const { createInstrumentationConfig } = require('../../../../lib/config/instrumentations.js');

describe('@dotcom-reliability-kit/opentelemetry/lib/config/instrumentation', () => {
	it('exports a function', () => {
		assert.strictEqual(typeof createInstrumentationConfig, 'function');
	});

	describe('createInstrumentationConfig()', () => {
		let instrumentations;

		beforeEach(() => {
			instrumentations = createInstrumentationConfig();
		});

		it('creates Node.js auto-instrumentations with some configurations', () => {
			assert.strictEqual(getNodeAutoInstrumentations.mock.callCount(), 1);
			const config = getNodeAutoInstrumentations.mock.calls[0].arguments[0];
			assert.strictEqual(typeof config, 'object');
			assert.strictEqual(
				typeof config['@opentelemetry/instrumentation-http']?.ignoreIncomingRequestHook,
				'function'
			);
			assert.deepStrictEqual(config['@opentelemetry/instrumentation-pino'], {
				enabled: false
			});
		});

		describe('ignore incoming request hook function', () => {
			let ignoreIncomingRequestHook;

			before(() => {
				ignoreIncomingRequestHook =
					getNodeAutoInstrumentations.mock.calls[0].arguments[0][
						'@opentelemetry/instrumentation-http'
					].ignoreIncomingRequestHook;
			});

			it('returns `true` with a request to `/__gtg`', () => {
				const mockRequest = {
					url: '/__gtg?a=b',
					headers: { host: 'mock-host' }
				};
				assert.strictEqual(ignoreIncomingRequestHook(mockRequest), true);
			});

			it('returns `true` with a request to `/__health`', () => {
				const mockRequest = {
					url: '/__health?a=b',
					headers: { host: 'mock-host' }
				};
				assert.strictEqual(ignoreIncomingRequestHook(mockRequest), true);
			});

			it('returns `true` with a request to `/favicon.ico`', () => {
				const mockRequest = {
					url: '/favicon.ico?a=b',
					headers: { host: 'mock-host' }
				};
				assert.strictEqual(ignoreIncomingRequestHook(mockRequest), true);
			});

			it('returns `false` with a request to anything else', () => {
				const mockRequest = {
					url: '/mock-endpoint',
					headers: { host: 'mock-host' }
				};
				assert.strictEqual(ignoreIncomingRequestHook(mockRequest), false);
			});

			it('returns `false` when a request URL is not present', () => {
				const mockRequest = {
					url: undefined,
					headers: { host: 'mock-host' }
				};
				assert.strictEqual(ignoreIncomingRequestHook(mockRequest), false);
			});

			it("doesn't throw when the host header isn't set", () => {
				const mockRequest = {
					url: '/mock-endpoint',
					headers: {}
				};
				assert.doesNotThrow(() => ignoreIncomingRequestHook(mockRequest));
			});

			it('logs a warning and returns `false` when a request URL cannot be parsed', () => {
				const mockRequest = {
					url: '/mock-endpont',
					headers: { host: '' }
				};
				assert.strictEqual(ignoreIncomingRequestHook(mockRequest), false);
				assert.strictEqual(UserInputError.mock.callCount(), 1);
				assert.partialDeepStrictEqual(UserInputError.mock.calls[0].arguments, [
					{
						code: 'OTEL_REQUEST_FILTER_FAILURE'
					}
				]);
				assert.strictEqual(logRecoverableError.mock.callCount(), 1);
				assert.partialDeepStrictEqual(logRecoverableError.mock.calls[0].arguments, [
					{
						error: new UserInputError(),
						request: mockRequest
					}
				]);
			});
		});

		it('returns the auto-instrumentations', () => {
			assert.strictEqual(instrumentations, 'mock-auto-instrumentations');
		});
	});
});
