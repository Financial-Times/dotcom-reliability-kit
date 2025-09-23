const { AggregationType, InstrumentType } =
	require('@opentelemetry/sdk-node').metrics;
const logger = require('@dotcom-reliability-kit/logger');

/**
 * @import { NodeSDKConfiguration } from '@opentelemetry/sdk-node'
 * @import { ViewOptions as OpenTelemetryView } from '@opentelemetry/sdk-metrics'
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
	const views = [
		...buildHistogramView({
			instrumentName: 'http.client.duration',
			boundaries: httpClientDurationBuckets,
			errorMessage:
				'HTTP client duration buckets must only contain positive numbers'
		}),
		...buildHistogramView({
			instrumentName: 'http.server.duration',
			boundaries: httpServerDurationBuckets,
			errorMessage:
				'HTTP server duration buckets must only contain positive numbers'
		})
	];
	return views.length ? { views } : {};
};

/**
 * @param {object} options
 * @param {string} options.instrumentName
 * @param {number[] | undefined} options.boundaries
 * @param {string} options.errorMessage
 * @returns {OpenTelemetryView[]}
 */
function buildHistogramView({ instrumentName, boundaries, errorMessage }) {
	if (Array.isArray(boundaries) && boundaries?.length) {
		if (boundaries.every(isPositiveNumber)) {
			return [
				{
					instrumentName,
					instrumentType: InstrumentType.HISTOGRAM,
					aggregation: {
						type: AggregationType.EXPLICIT_BUCKET_HISTOGRAM,
						options: { boundaries }
					}
				}
			];
		}
		logger.warn({ event: 'OTEL_VIEW_CONFIG_ISSUE', message: errorMessage });
	}
	return [];
}

/**
 * @param {any} value
 * @returns {value is number}
 */
function isPositiveNumber(value) {
	return Number.isFinite(value) && value >= 0;
}
