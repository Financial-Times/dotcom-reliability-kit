const { createInstrumentationConfig } = require('./config/instrumentations');
const { createMetricsConfig } = require('./config/metrics');
const { createResourceConfig } = require('./config/resource');
const { createTracingConfig } = require('./config/tracing');
const { HostMetrics } = require('@opentelemetry/host-metrics');
const opentelemetry = require('@opentelemetry/sdk-node');
const logger = require('@dotcom-reliability-kit/logger');

/**
 * @import { Instances, Options } from '@dotcom-reliability-kit/opentelemetry'
 */

/**
 * Stores the singleton instances that were created during OpenTelemetry setup.
 *
 * @type {Instances | undefined}
 */
let instances;

/**
 * Set up OpenTelemetry tracing.
 *
 * @param {Options} [options]
 * @returns {Instances}
 */
function setupOpenTelemetry({
	authorizationHeader,
	metrics: metricsOptions,
	tracing: tracingOptions
} = {}) {
	if (instances) {
		return instances;
	}

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
	opentelemetry.api.diag.setLogger(
		// @ts-ignore this complains because DiagLogger accepts a type
		// of unknown whereas our logger is stricter. This is fine though,
		// if something unknown is logged then we do our best with it.
		// It's easier to ignore this error than fix it.
		logger.createChildLogger({ event: 'OTEL_INTERNALS' }),
		opentelemetry.api.DiagLogLevel.INFO
	);

	// Set up and start OpenTelemetry
	instances = {
		hostMetrics: undefined,
		sdk: new opentelemetry.NodeSDK({
			// Configurations we set regardless of whether we're using tracing
			instrumentations: createInstrumentationConfig(),
			resource: createResourceConfig(),

			// Add metrics-specific configurations
			...createMetricsConfig(metricsOptions || {}),

			// Add tracing-specific configurations
			...createTracingConfig({
				authorizationHeader,
				...tracingOptions
			})
		})
	};
	instances.sdk.start();

	// Set up host metrics if we have a metrics endpoint
	if (metricsOptions?.endpoint) {
		instances.hostMetrics = new HostMetrics();
		instances.hostMetrics.start();
	}

	return instances;
}

/**
 * Get a metrics meter from the configured OpenTelemetry SDK.
 *
 * @param {string} name
 * @param {string} [version]
 * @param {opentelemetry.api.MeterOptions} [options]
 * @returns {opentelemetry.api.Meter}
 */
function getMeter(name, version, options) {
	if (!instances) {
		throw Object.assign(
			new Error(
				'Reliability Kit OpenTelemetry must be set up before meters can be created. See the setup guide for more information: https://github.com/Financial-Times/dotcom-reliability-kit/tree/main/packages/opentelemetry#setup'
			),
			{
				code: 'OTEL_MISSING_SETUP'
			}
		);
	}
	return opentelemetry.api.metrics.getMeter(name, version, options);
}

exports.setup = setupOpenTelemetry;
exports.getMeter = getMeter;
