const { createInstrumentationConfig } = require('./config/instrumentations');
const { createMetricsConfig } = require('./config/metrics');
const { createResourceConfig } = require('./config/resource');
const { createTracingConfig } = require('./config/tracing');
const { HostMetrics } = require('@opentelemetry/host-metrics');
const opentelemetry = require('@opentelemetry/sdk-node');
const logger = require('@dotcom-reliability-kit/logger');

/**
 * @import { Instances, Options } from '@dotcom-reliability-kit/opentelemetry'
 * @import { MeterProvider } from '@opentelemetry/sdk-metrics'
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
	logInternals,
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

	// We need to create a new logger for OpenTelemetry internals
	// because the function signature is different and OpenTelemetry
	// logs mutliple strings. With pino this means we lose data
	if (logInternals) {
		const log = logger.createChildLogger({ event: 'OTEL_INTERNALS' });
		const opentelemetryLogger = {
			error: (...args) => log.error(args[0], { details: args.slice(1) }),
			info: (...args) => log.info(args[0], { details: args.slice(1) }),
			warn: (...args) => log.warn(args[0], { details: args.slice(1) }),
			debug: () => {},
			verbose: () => {}
		};
		opentelemetry.api.diag.setLogger(opentelemetryLogger);
	} else {
		opentelemetry.api.diag.disable();
	}

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

	// HACK: this is required to make sure we record metrics for node-fetch.
	// This is a known issue, the workaround is to import 'https' to ensure
	// that the instrumented version is used by node-fetch. See:
	// https://github.com/open-telemetry/opentelemetry-js-contrib/issues/2440
	require('https');

	// Set up host metrics if we have a metrics endpoint
	if (metricsOptions?.endpoint) {
		const meterProvider = /** @type {MeterProvider} */ (
			opentelemetry.api.metrics.getMeterProvider()
		);
		instances.hostMetrics = new HostMetrics({ meterProvider });
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
