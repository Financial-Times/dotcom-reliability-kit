const setupOpenTelemetry = require('./lib/index.js');

/** @type {setupOpenTelemetry.TracingOptions | undefined} */
let tracing = undefined;
if (process.env.OPENTELEMETRY_TRACING_ENDPOINT) {
	tracing = {
		endpoint: process.env.OPENTELEMETRY_TRACING_ENDPOINT
	};
}

setupOpenTelemetry({
	authorizationHeader: process.env.OPENTELEMETRY_AUTHORIZATION_HEADER,
	tracing
});
