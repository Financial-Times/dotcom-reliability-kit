const setupOpenTelemetry = require('./lib/index.js');

setupOpenTelemetry({
	tracesEndpoint: process.env.OPENTELEMETRY_TRACES_ENDPOINT
});
