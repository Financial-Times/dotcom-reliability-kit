const { AggregationType, InstrumentType } =
	require('@opentelemetry/sdk-node').metrics;
const logger = require('@dotcom-reliability-kit/logger');

/**
 * @import { NodeSDKConfiguration } from '@opentelemetry/sdk-node'
 * @import { ViewOptions } from '@dotcom-reliability-kit/opentelemetry'
 */

/**
 * Create an OpenTelemetry views configuration.
 *
 * @param {ViewOptions} options
 * @returns {Partial<NodeSDKConfiguration>}
 */
exports.createViewConfig = function createViewConfig({
	httpClientDurationBuckets,
	httpServerDurationBuckets
}) {
	/** @type {Partial<NodeSDKConfiguration>} */
	const config = {};

	if (
		Array.isArray(httpClientDurationBuckets) &&
		httpClientDurationBuckets?.length
	) {
		if (httpClientDurationBuckets.every(isPositiveNumber)) {
			config.views ??= [];
			config.views.push({
				instrumentName: 'http.client.duration',
				instrumentType: InstrumentType.HISTOGRAM,
				aggregation: {
					type: AggregationType.EXPLICIT_BUCKET_HISTOGRAM,
					options: { boundaries: httpClientDurationBuckets }
				}
			});
		} else {
			logger.warn({
				event: 'OTEL_VIEW_CONFIG_ISSUE',
				message:
					'HTTP client duration buckets must only contain positive numbers'
			});
		}
	}

	if (
		Array.isArray(httpServerDurationBuckets) &&
		httpServerDurationBuckets?.length
	) {
		if (httpServerDurationBuckets.every(isPositiveNumber)) {
			config.views ??= [];
			config.views.push({
				instrumentName: 'http.server.duration',
				instrumentType: InstrumentType.HISTOGRAM,
				aggregation: {
					type: AggregationType.EXPLICIT_BUCKET_HISTOGRAM,
					options: { boundaries: httpServerDurationBuckets }
				}
			});
		} else {
			logger.warn({
				event: 'OTEL_VIEW_CONFIG_ISSUE',
				message:
					'HTTP server duration buckets must only contain positive numbers'
			});
		}
	}

	return config;
};

/**
 * @param {any} value
 * @returns {value is number}
 */
function isPositiveNumber(value) {
	return Number.isFinite(value) && value >= 0;
}
