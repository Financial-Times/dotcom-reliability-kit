const opentelemetry = require('./lib/index');

/**
 * @import { MetricsOptions, TracingOptions, ViewOptions } from '@dotcom-reliability-kit/opentelemetry'
 */

/** @type {TracingOptions | undefined} */
let tracing;
if (process.env.OPENTELEMETRY_TRACING_ENDPOINT) {
	tracing = {
		authorizationHeader: process.env.OPENTELEMETRY_AUTHORIZATION_HEADER,
		endpoint: process.env.OPENTELEMETRY_TRACING_ENDPOINT,
		samplePercentage: process.env.OPENTELEMETRY_TRACING_SAMPLE_PERCENTAGE
			? Number(process.env.OPENTELEMETRY_TRACING_SAMPLE_PERCENTAGE)
			: undefined
	};
}

/** @type {MetricsOptions | undefined} */
let metrics;
if (process.env.OPENTELEMETRY_METRICS_ENDPOINT) {
	metrics = {
		apiGatewayKey: process.env.OPENTELEMETRY_API_GATEWAY_KEY,
		endpoint: process.env.OPENTELEMETRY_METRICS_ENDPOINT
	};
}

/**
 * @param {string} input
 * @returns {number[]}
 */
function parseListOfNumbers(input) {
	return input.split(',').map((item) => Number(item.trim()));
}

/** @type {ViewOptions} */
const views = {};
if (process.env.OPENTELEMETRY_VIEWS_HTTP_SERVER_DURATION_BUCKETS) {
	views.httpServerDurationBuckets = parseListOfNumbers(
		process.env.OPENTELEMETRY_VIEWS_HTTP_SERVER_DURATION_BUCKETS
	);
}
if (process.env.OPENTELEMETRY_VIEWS_HTTP_CLIENT_DURATION_BUCKETS) {
	views.httpClientDurationBuckets = parseListOfNumbers(
		process.env.OPENTELEMETRY_VIEWS_HTTP_CLIENT_DURATION_BUCKETS
	);
}

opentelemetry.setup({
	logInternals: Boolean(process.env.OPENTELEMETRY_LOG_INTERNALS),
	metrics,
	tracing,
	views
});
