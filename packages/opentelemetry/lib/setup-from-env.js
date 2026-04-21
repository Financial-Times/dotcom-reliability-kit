import { setup } from './index.js';

/**
 * @import { MetricsOptions, TracingOptions, ViewOptions } from '@dotcom-reliability-kit/opentelemetry'
 */

/**
 * @param {NodeJS.ProcessEnv} env
 */
export function setupFromEnv(env) {
	/** @type {TracingOptions | undefined} */
	let tracing;
	if (env.OPENTELEMETRY_TRACING_ENDPOINT) {
		tracing = {
			authorizationHeader: env.OPENTELEMETRY_AUTHORIZATION_HEADER,
			endpoint: env.OPENTELEMETRY_TRACING_ENDPOINT,
			samplePercentage: env.OPENTELEMETRY_TRACING_SAMPLE_PERCENTAGE
				? Number(env.OPENTELEMETRY_TRACING_SAMPLE_PERCENTAGE)
				: undefined
		};
	}

	/** @type {MetricsOptions | undefined} */
	let metrics;
	if (env.OPENTELEMETRY_METRICS_ENDPOINT) {
		metrics = {
			apiGatewayKey: env.OPENTELEMETRY_API_GATEWAY_KEY,
			endpoint: env.OPENTELEMETRY_METRICS_ENDPOINT
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
	if (env.OPENTELEMETRY_VIEWS_HTTP_SERVER_DURATION_BUCKETS) {
		views.httpServerDurationBuckets = parseListOfNumbers(
			env.OPENTELEMETRY_VIEWS_HTTP_SERVER_DURATION_BUCKETS
		);
	}
	if (env.OPENTELEMETRY_VIEWS_HTTP_CLIENT_DURATION_BUCKETS) {
		views.httpClientDurationBuckets = parseListOfNumbers(
			env.OPENTELEMETRY_VIEWS_HTTP_CLIENT_DURATION_BUCKETS
		);
	}

	setup({
		logInternals: Boolean(env.OPENTELEMETRY_LOG_INTERNALS),
		metrics,
		tracing,
		views
	});
}
