const opentelemetry = require('.');

/** @type {opentelemetry.TracingOptions | undefined} */
let tracing = undefined;
if (process.env.OPENTELEMETRY_TRACING_ENDPOINT) {
	tracing = {
		authorizationHeader: process.env.OPENTELEMETRY_AUTHORIZATION_HEADER,
		endpoint: process.env.OPENTELEMETRY_TRACING_ENDPOINT,
		samplePercentage: process.env.OPENTELEMETRY_TRACING_SAMPLE_PERCENTAGE
			? Number(process.env.OPENTELEMETRY_TRACING_SAMPLE_PERCENTAGE)
			: undefined
	};
}

/** @type {opentelemetry.MetricsOptions | undefined} */
let metrics = undefined;
if (process.env.OPENTELEMETRY_METRICS_ENDPOINT) {
	metrics = {
		apiGatewayKey: process.env.OPENTELEMETRY_API_GATEWAY_KEY,
		endpoint: process.env.OPENTELEMETRY_METRICS_ENDPOINT
	};
}

opentelemetry.setup({
	metrics,
	tracing
});
