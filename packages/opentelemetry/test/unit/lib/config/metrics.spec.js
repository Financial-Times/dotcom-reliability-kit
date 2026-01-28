const { before, describe, it, mock } = require('node:test');
const assert = require('node:assert/strict');

const logger = { info: mock.fn() };
mock.module('@dotcom-reliability-kit/logger', { defaultExport: logger });

mock.module('../../../../lib/config/user-agents.js', {
	namedExports: { METRICS_USER_AGENT: 'mock-metrics-user-agent' }
});

const OTLPMetricExporter = mock.fn(class OTLPMetricExporter {});
mock.module('@opentelemetry/exporter-metrics-otlp-proto', { namedExports: { OTLPMetricExporter } });

const PeriodicExportingMetricReader = mock.fn(class PeriodicExportingMetricReader {});
mock.module('@opentelemetry/sdk-node', {
	namedExports: { metrics: { PeriodicExportingMetricReader } }
});

mock.module('@opentelemetry/otlp-exporter-base', {
	namedExports: { CompressionAlgorithm: { GZIP: 'gzip' } }
});

const { createMetricsConfig } = require('../../../../lib/config/metrics');

describe('@dotcom-reliability-kit/opentelemetry/lib/config/metrics', () => {
	it('exports a function', () => {
		assert.strictEqual(typeof createMetricsConfig, 'function');
	});

	describe('createMetricsConfig(options)', () => {
		let config;

		before(() => {
			config = createMetricsConfig({
				apiGatewayKey: 'mock-api-gateway-key',
				endpoint: 'mock-endpoint'
			});
		});

		it('creates a metrics exporter', () => {
			assert.strictEqual(OTLPMetricExporter.mock.callCount(), 1);
			assert.deepStrictEqual(OTLPMetricExporter.mock.calls[0].arguments, [
				{
					url: 'mock-endpoint',
					compression: 'gzip',
					headers: {
						'X-OTel-Key': 'mock-api-gateway-key',
						'user-agent': 'mock-metrics-user-agent'
					}
				}
			]);
		});

		it('creates a metrics reader with the configured exporter', () => {
			assert.strictEqual(PeriodicExportingMetricReader.mock.callCount(), 1);
			assert.deepStrictEqual(PeriodicExportingMetricReader.mock.calls[0].arguments, [
				{
					exporter: OTLPMetricExporter.mock.calls[0].result
				}
			]);
		});

		it('logs that metrics are enabled', () => {
			assert.strictEqual(logger.info.mock.callCount(), 1);
			assert.deepStrictEqual(logger.info.mock.calls[0].arguments, [
				{
					enabled: true,
					endpoint: 'mock-endpoint',
					event: 'OTEL_METRICS_STATUS',
					message:
						'OpenTelemetry metrics are enabled and exporting to endpoint mock-endpoint'
				}
			]);
		});

		it('returns the configuration', () => {
			assert.deepStrictEqual(config, {
				metricReaders: [PeriodicExportingMetricReader.mock.calls[0].result]
			});
		});

		describe('when options.apiGatewayKey is not defined', () => {
			before(() => {
				OTLPMetricExporter.mock.resetCalls();
				config = createMetricsConfig({
					endpoint: 'mock-endpoint'
				});
			});

			it('creates a metrics exporter without an X-OTel-Key header', () => {
				assert.strictEqual(OTLPMetricExporter.mock.callCount(), 1);
				assert.deepStrictEqual(OTLPMetricExporter.mock.calls[0].arguments, [
					{
						url: 'mock-endpoint',
						compression: 'gzip',
						headers: {
							'user-agent': 'mock-metrics-user-agent'
						}
					}
				]);
			});
		});

		describe('when options.endpoint is not defined', () => {
			before(() => {
				logger.info.mock.resetCalls();
				OTLPMetricExporter.mock.resetCalls();
				PeriodicExportingMetricReader.mock.resetCalls();
				config = createMetricsConfig({});
			});

			it('does not create a metrics exporter', () => {
				assert.strictEqual(OTLPMetricExporter.mock.callCount(), 0);
			});

			it('does not create a metrics reader', () => {
				assert.strictEqual(PeriodicExportingMetricReader.mock.callCount(), 0);
			});

			it('logs that metrics are disabled', () => {
				assert.strictEqual(logger.info.mock.callCount(), 1);
				assert.deepStrictEqual(logger.info.mock.calls[0].arguments, [
					{
						enabled: false,
						endpoint: null,
						event: 'OTEL_METRICS_STATUS',
						message:
							'OpenTelemetry metrics are disabled because no metrics endpoint was set'
					}
				]);
			});

			it('returns the empty configuration', () => {
				assert.deepStrictEqual(config, {});
			});
		});
	});
});
