const {
	OTLPMetricExporter
} = require('@opentelemetry/exporter-metrics-otlp-proto');
const { CompressionAlgorithm } = require('@opentelemetry/otlp-exporter-base');
require('@opentelemetry/sdk-node');
const { PeriodicExportingMetricReader } =
	require('@opentelemetry/sdk-node').metrics;
const logger = require('@dotcom-reliability-kit/logger');
const { METRICS_USER_AGENT } = require('./user-agents');

/**
 * Create an OpenTelemetry metrics configuration.
 *
 * @param {import('@dotcom-reliability-kit/opentelemetry').MetricsOptions} options
 * @returns {Partial<import('@opentelemetry/sdk-node').NodeSDKConfiguration>}
 */
exports.createMetricsConfig = function createMetricsConfig(options) {
	/** @type {Partial<import('@opentelemetry/sdk-node').NodeSDKConfiguration>} */
	const config = {};

	// If we have an OpenTelemetry metrics endpoint then set it up
	if (options?.endpoint) {
		const headers = {
			'user-agent': METRICS_USER_AGENT
		};
		if (options.apiGatewayKey) {
			headers['X-OTel-Key'] = options.apiGatewayKey;
		}
		config.metricReader = new PeriodicExportingMetricReader({
			exporter: new OTLPMetricExporter({
				url: options.endpoint,
				compression: CompressionAlgorithm.GZIP,
				headers
			})
		});

		logger.info({
			event: 'OTEL_METRICS_STATUS',
			message: `OpenTelemetry metrics are enabled and exporting to endpoint ${options.endpoint}`,
			enabled: true,
			endpoint: options.endpoint
		});
	} else {
		logger.info({
			event: 'OTEL_METRICS_STATUS',
			message:
				'OpenTelemetry metrics are disabled because no metrics endpoint was set',
			enabled: false,
			endpoint: null
		});
	}

	return config;
};
