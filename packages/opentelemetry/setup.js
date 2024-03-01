const setupOpenTelemetry = require('./lib/index.js');

/** @type {setupOpenTelemetry.TracingOptions | undefined} */
let tracing = undefined;
if (process.env.OPENTELEMETRY_TRACING_ENDPOINT) {
	tracing = {
		endpoint: process.env.OPENTELEMETRY_TRACING_ENDPOINT,
		samplePercentage: process.env.OPENTELEMETRY_TRACING_SAMPLE_PERCENTAGE
			? Number(process.env.OPENTELEMETRY_TRACING_SAMPLE_PERCENTAGE)
			: undefined
	};
}
/** @type {setupOpenTelemetry.MetricsOptions | undefined} */
let metrics = undefined;
if (process.env.OPENTELEMETRY_METRICS_ENDPOINT) {
	metrics = {
		endpoint: process.env.OPENTELEMETRY_METRICS_ENDPOINT
	};
}

setupOpenTelemetry({
	authorizationHeader: process.env.OPENTELEMETRY_AUTHORIZATION_HEADER,
	tracing,
	metrics
});
