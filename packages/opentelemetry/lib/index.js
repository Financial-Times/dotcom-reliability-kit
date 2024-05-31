const { createInstrumentationConfig } = require('./config/instrumentations');
const { createResourceConfig } = require('./config/resource');
const { createTracingConfig } = require('./config/tracing');
const { diag, DiagLogLevel } = require('@opentelemetry/api');
const opentelemetrySDK = require('@opentelemetry/sdk-node');
const logger = require('@dotcom-reliability-kit/logger');

/**
 * @typedef {import('./config/tracing').TracingOptions} TracingOptions
 */

/**
 * @typedef {object} Options
 * @property {string} [authorizationHeader]
 *      [DEPRECATED] The HTTP `Authorization` header to send with OpenTelemetry requests. Use `tracing.authorizationHeader` instead.
 * @property {TracingOptions} [tracing]
 *      Configuration options for OpenTelemetry tracing.
 */

/**
 * Set up OpenTelemetry tracing.
 *
 * @param {Options} [options]
 *      OpenTelemetry configuration options.
 */
function setupOpenTelemetry({
	authorizationHeader,
	tracing: tracingOptions
} = {}) {
	// We don't support using the built-in `OTEL_`-prefixed environment variables. We
	// do want to know when these are used, though, so that we can easily spot when
	// an app's use of these environment variables might be interfering.
	const environmentVariables = Object.keys(process.env);
	if (environmentVariables.some((key) => key.startsWith('OTEL_'))) {
		logger.warn({
			event: 'OTEL_ENVIRONMENT_VARIABLES_DEFINED',
			message:
				'OTEL-prefixed environment variables are defined, this use-case is not supported by Reliability Kit. You may encounter issues'
		});
	}

	// Use a Reliability Kit logger for logging. The DiagLogLevel
	// does nothing here – Reliability Kit's log level (set through
	// the LOG_LEVEL environment variable) takes over. We set the
	// OpenTelemetry log level to the maximum value that we want
	// Reliability Kit to consider logging
	diag.setLogger(
		logger.createChildLogger({ event: 'OTEL_INTERNALS' }),
		DiagLogLevel.INFO
	);

	// Set up and start OpenTelemetry
	const sdk = new opentelemetrySDK.NodeSDK({
		// Configurations we set regardless of whether we're using tracing
		instrumentations: createInstrumentationConfig(),
		resource: createResourceConfig(),

		// Add tracing-specific configurations
		...createTracingConfig({
			authorizationHeader,
			...tracingOptions
		})
	});
	sdk.start();
}

module.exports = setupOpenTelemetry;

// @ts-ignore
module.exports.default = module.exports;
