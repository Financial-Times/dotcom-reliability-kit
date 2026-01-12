jest.mock('@opentelemetry/exporter-metrics-otlp-proto');
jest.mock('@opentelemetry/otlp-exporter-base');
jest.mock('@opentelemetry/sdk-node');
jest.mock('@dotcom-reliability-kit/logger');
jest.mock('../../../../lib/config/user-agents', () => ({
	METRICS_USER_AGENT: 'mock-metrics-user-agent'
}));

const logger = require('@dotcom-reliability-kit/logger');
const { OTLPMetricExporter } = require('@opentelemetry/exporter-metrics-otlp-proto');
const { PeriodicExportingMetricReader } = require('@opentelemetry/sdk-node').metrics;
const { createMetricsConfig } = require('../../../../lib/config/metrics');

describe('@dotcom-reliability-kit/opentelemetry/lib/config/metrics', () => {
	it('exports a function', () => {
		expect(typeof createMetricsConfig).toBe('function');
	});

	describe('createMetricsConfig(options)', () => {
		let config;

		beforeAll(() => {
			config = createMetricsConfig({
				apiGatewayKey: 'mock-api-gateway-key',
				endpoint: 'mock-endpoint'
			});
		});

		it('creates a metrics exporter', () => {
			expect(OTLPMetricExporter).toHaveBeenCalledTimes(1);
			expect(OTLPMetricExporter).toHaveBeenCalledWith({
				url: 'mock-endpoint',
				compression: 'gzip',
				headers: {
					'X-OTel-Key': 'mock-api-gateway-key',
					'user-agent': 'mock-metrics-user-agent'
				}
			});
		});

		it('creates a metrics reader with the configured exporter', () => {
			expect(PeriodicExportingMetricReader).toHaveBeenCalledTimes(1);
			expect(PeriodicExportingMetricReader).toHaveBeenCalledWith({
				exporter: expect.any(OTLPMetricExporter)
			});
		});

		it('logs that metrics are enabled', () => {
			expect(logger.info).toHaveBeenCalledWith({
				enabled: true,
				endpoint: 'mock-endpoint',
				event: 'OTEL_METRICS_STATUS',
				message: 'OpenTelemetry metrics are enabled and exporting to endpoint mock-endpoint'
			});
		});

		it('returns the configuration', () => {
			expect(config).toEqual({
				metricReaders: [PeriodicExportingMetricReader.mock.instances[0]]
			});
		});

		describe('when options.apiGatewayKey is not defined', () => {
			beforeAll(() => {
				OTLPMetricExporter.mockClear();
				config = createMetricsConfig({
					endpoint: 'mock-endpoint'
				});
			});

			it('creates a metrics exporter without an X-OTel-Key header', () => {
				expect(OTLPMetricExporter).toHaveBeenCalledTimes(1);
				expect(OTLPMetricExporter).toHaveBeenCalledWith({
					url: 'mock-endpoint',
					compression: 'gzip',
					headers: {
						'user-agent': 'mock-metrics-user-agent'
					}
				});
			});
		});

		describe('when options.endpoint is not defined', () => {
			beforeAll(() => {
				OTLPMetricExporter.mockClear();
				PeriodicExportingMetricReader.mockClear();
				config = createMetricsConfig({});
			});

			it('does not create a metrics exporter', () => {
				expect(OTLPMetricExporter).toHaveBeenCalledTimes(0);
			});

			it('does not create a metrics reader', () => {
				expect(PeriodicExportingMetricReader).toHaveBeenCalledTimes(0);
			});

			it('logs that metrics are disabled', () => {
				expect(logger.info).toHaveBeenCalledWith({
					enabled: false,
					endpoint: null,
					event: 'OTEL_METRICS_STATUS',
					message:
						'OpenTelemetry metrics are disabled because no metrics endpoint was set'
				});
			});

			it('returns the empty configuration', () => {
				expect(config).toEqual({});
			});
		});
	});
});
