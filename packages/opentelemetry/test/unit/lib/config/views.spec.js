const { before, describe, it, mock } = require('node:test');
const assert = require('node:assert/strict');

const logger = { warn: mock.fn() };
mock.module('@dotcom-reliability-kit/logger', { defaultExport: logger });

const metrics = {
	AggregationType: { EXPLICIT_BUCKET_HISTOGRAM: 'mock-explicit-bucket' },
	InstrumentType: { HISTOGRAM: 'mock-histogram' }
};
mock.module('@opentelemetry/sdk-node', { defaultExport: { metrics } });

const { createViewConfig } = require('../../../../lib/config/views');

describe('@dotcom-reliability-kit/opentelemetry/lib/config/views', () => {
	it('exports a function', () => {
		assert.strictEqual(typeof createViewConfig, 'function');
	});

	describe('createViewConfig(options)', () => {
		let config;

		before(() => {
			logger.warn.mock.resetCalls();
			config = createViewConfig({
				httpClientDurationBuckets: [1, 2, 3, 4],
				httpServerDurationBuckets: [5, 6, 7, 8]
			});
		});

		it('returns the configuration', () => {
			assert.deepStrictEqual(config, {
				views: [
					{
						instrumentName: 'http.client.duration',
						instrumentType: 'mock-histogram',
						aggregation: {
							type: 'mock-explicit-bucket',
							options: { boundaries: [1, 2, 3, 4] }
						}
					},
					{
						instrumentName: 'http.server.duration',
						instrumentType: 'mock-histogram',
						aggregation: {
							type: 'mock-explicit-bucket',
							options: { boundaries: [5, 6, 7, 8] }
						}
					}
				]
			});
		});

		describe('when options.httpClientDurationBuckets is not defined', () => {
			before(() => {
				logger.warn.mock.resetCalls();
				config = createViewConfig({
					httpServerDurationBuckets: [5, 6, 7, 8]
				});
			});

			it('returns the configuration without an HTTP client duration view', () => {
				assert.deepStrictEqual(config, {
					views: [
						{
							instrumentName: 'http.server.duration',
							instrumentType: 'mock-histogram',
							aggregation: {
								type: 'mock-explicit-bucket',
								options: { boundaries: [5, 6, 7, 8] }
							}
						}
					]
				});
			});
		});

		describe('when options.httpClientDurationBuckets contains negative numbers', () => {
			before(() => {
				logger.warn.mock.resetCalls();
				config = createViewConfig({
					httpClientDurationBuckets: [1, -2, 3, 4]
				});
			});

			it('returns the configuration without an HTTP server duration view', () => {
				assert.deepStrictEqual(config, {});
			});

			it('logs a warning', () => {
				assert.strictEqual(logger.warn.mock.callCount(), 1);
				assert.deepStrictEqual(logger.warn.mock.calls[0].arguments[0], {
					event: 'OTEL_VIEW_CONFIG_ISSUE',
					message:
						'HTTP client duration buckets must only contain numbers greater than zero'
				});
			});
		});

		describe('when options.httpClientDurationBuckets contains zero', () => {
			before(() => {
				logger.warn.mock.resetCalls();
				config = createViewConfig({
					httpClientDurationBuckets: [0, 1, 2, 3, 4]
				});
			});

			it('returns the configuration without an HTTP server duration view', () => {
				assert.deepStrictEqual(config, {});
			});

			it('logs a warning', () => {
				assert.strictEqual(logger.warn.mock.callCount(), 1);
				assert.deepStrictEqual(logger.warn.mock.calls[0].arguments[0], {
					event: 'OTEL_VIEW_CONFIG_ISSUE',
					message:
						'HTTP client duration buckets must only contain numbers greater than zero'
				});
			});
		});

		describe('when options.httpClientDurationBuckets contains non-numbers', () => {
			before(() => {
				logger.warn.mock.resetCalls();
				config = createViewConfig({
					httpClientDurationBuckets: [1, '2', 3, 4]
				});
			});

			it('returns the configuration without an HTTP server duration view', () => {
				assert.deepStrictEqual(config, {});
			});

			it('logs a warning', () => {
				assert.strictEqual(logger.warn.mock.callCount(), 1);
				assert.deepStrictEqual(logger.warn.mock.calls[0].arguments[0], {
					event: 'OTEL_VIEW_CONFIG_ISSUE',
					message:
						'HTTP client duration buckets must only contain numbers greater than zero'
				});
			});
		});

		describe('when options.httpServerDurationBuckets is not defined', () => {
			before(() => {
				logger.warn.mock.resetCalls();
				config = createViewConfig({
					httpClientDurationBuckets: [1, 2, 3, 4]
				});
			});

			it('returns the configuration without an HTTP server duration view', () => {
				assert.deepStrictEqual(config, {
					views: [
						{
							instrumentName: 'http.client.duration',
							instrumentType: 'mock-histogram',
							aggregation: {
								type: 'mock-explicit-bucket',
								options: { boundaries: [1, 2, 3, 4] }
							}
						}
					]
				});
			});
		});

		describe('when options.httpServerDurationBuckets contains negative numbers', () => {
			before(() => {
				logger.warn.mock.resetCalls();
				config = createViewConfig({
					httpServerDurationBuckets: [1, -2, 3, 4]
				});
			});

			it('returns the configuration without an HTTP server duration view', () => {
				assert.deepStrictEqual(config, {});
			});

			it('logs a warning', () => {
				assert.strictEqual(logger.warn.mock.callCount(), 1);
				assert.deepStrictEqual(logger.warn.mock.calls[0].arguments[0], {
					event: 'OTEL_VIEW_CONFIG_ISSUE',
					message:
						'HTTP server duration buckets must only contain numbers greater than zero'
				});
			});
		});

		describe('when options.httpServerDurationBuckets contains zero', () => {
			before(() => {
				logger.warn.mock.resetCalls();
				config = createViewConfig({
					httpServerDurationBuckets: [0, 1, 2, 3, 4]
				});
			});

			it('returns the configuration without an HTTP server duration view', () => {
				assert.deepStrictEqual(config, {});
			});

			it('logs a warning', () => {
				assert.strictEqual(logger.warn.mock.callCount(), 1);
				assert.deepStrictEqual(logger.warn.mock.calls[0].arguments[0], {
					event: 'OTEL_VIEW_CONFIG_ISSUE',
					message:
						'HTTP server duration buckets must only contain numbers greater than zero'
				});
			});
		});

		describe('when options.httpServerDurationBuckets contains non-numbers', () => {
			before(() => {
				logger.warn.mock.resetCalls();
				config = createViewConfig({
					httpServerDurationBuckets: [1, '2', 3, 4]
				});
			});

			it('returns the configuration without an HTTP server duration view', () => {
				assert.deepStrictEqual(config, {});
			});

			it('logs a warning', () => {
				assert.strictEqual(logger.warn.mock.callCount(), 1);
				assert.deepStrictEqual(logger.warn.mock.calls[0].arguments[0], {
					event: 'OTEL_VIEW_CONFIG_ISSUE',
					message:
						'HTTP server duration buckets must only contain numbers greater than zero'
				});
			});
		});

		describe('when no options are defined', () => {
			before(() => {
				logger.warn.mock.resetCalls();
				config = createViewConfig({});
			});

			it('returns the configuration without any views', () => {
				assert.deepStrictEqual(config, {});
			});
		});
	});
});
