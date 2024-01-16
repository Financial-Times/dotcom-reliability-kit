const setupOpenTelemetry = require('./lib/index.js');

setupOpenTelemetry({
	authorizationHeader: process.env.OPENTELEMETRY_AUTHORIZATION_HEADER,
	tracesEndpoint: process.env.OPENTELEMETRY_TRACES_ENDPOINT
});
