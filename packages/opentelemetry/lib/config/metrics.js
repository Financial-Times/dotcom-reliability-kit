import logger from '@dotcom-reliability-kit/logger';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-proto';
import { CompressionAlgorithm } from '@opentelemetry/otlp-exporter-base';
import { metrics } from '@opentelemetry/sdk-node';
import { METRICS_USER_AGENT } from './user-agents.js';

const { PeriodicExportingMetricReader } = metrics;

/**
 * @import { NodeSDKConfiguration } from '@opentelemetry/sdk-node'
 * @import { MetricsOptions } from '@dotcom-reliability-kit/opentelemetry'
 */

/**
 * Create an OpenTelemetry metrics configuration.
 *
 * @param {MetricsOptions} options
 * @returns {Partial<NodeSDKConfiguration>}
 */
export function createMetricsConfig(options) {
	/** @type {Partial<NodeSDKConfiguration>} */
	const config = {};

	// If we have an OpenTelemetry metrics endpoint then set it up
	if (options?.endpoint) {
		const headers = {
			'user-agent': METRICS_USER_AGENT
		};
		if (options.apiGatewayKey) {
			headers['X-OTel-Key'] = options.apiGatewayKey;
		}
		config.metricReaders = [
			new PeriodicExportingMetricReader({
				exporter: new OTLPMetricExporter({
					url: options.endpoint,
					compression: CompressionAlgorithm.GZIP,
					headers
				})
			})
		];

		logger.info({
			event: 'OTEL_METRICS_STATUS',
			message: `OpenTelemetry metrics are enabled and exporting to endpoint ${options.endpoint}`,
			enabled: true,
			endpoint: options.endpoint
		});
	} else {
		logger.info({
			event: 'OTEL_METRICS_STATUS',
			message: 'OpenTelemetry metrics are disabled because no metrics endpoint was set',
			enabled: false,
			endpoint: null
		});
	}

	return config;
}
