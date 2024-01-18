const packageJson = require('../package.json');
const { diag, DiagLogLevel } = require('@opentelemetry/api');
const {
	getNodeAutoInstrumentations
} = require('@opentelemetry/auto-instrumentations-node');
const { Resource } = require('@opentelemetry/resources');
const opentelemetrySDK = require('@opentelemetry/sdk-node');
const {
	SemanticResourceAttributes
} = require('@opentelemetry/semantic-conventions');
const appInfo = require('@dotcom-reliability-kit/app-info');
const {
	OTLPTraceExporter
} = require('@opentelemetry/exporter-trace-otlp-proto');
const traceExporterPackageJson = require('@opentelemetry/exporter-trace-otlp-proto/package.json');
const { NoopSpanProcessor } = require('@opentelemetry/sdk-trace-base');
const logger = require('@dotcom-reliability-kit/logger');

const USER_AGENT = `FTSystem/${appInfo.systemCode} (${packageJson.name}/${packageJson.version})`;
const TRACING_USER_AGENT = `${USER_AGENT} (${traceExporterPackageJson.name}/${traceExporterPackageJson.version})`;

/**
 * @typedef {object} Options
 * @property {string} [authorizationHeader]
 *      The HTTP `Authorization` header to send with OpenTelemetry requests.
 * @property {TracingOptions} [tracing]
 *      Configuration options for OpenTelemetry tracing.
 */

/**
 * @typedef {object} TracingOptions
 * @property {string} endpoint
 *     The URL to send OpenTelemetry trace segments to, for example http://localhost:4318/v1/traces.
 */

/**
 * Set up OpenTelemetry tracing.
 *
 * @param {Options} [options]
 *      OpenTelemetry configuration options.
 */
function setupOpenTelemetry({ authorizationHeader, tracing } = {}) {
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

	// Construct the OpenTelemetry SDK configuration
	/** @type {opentelemetrySDK.NodeSDKConfiguration} */
	const openTelemetryConfig = {};

	// Set OpenTelemetry resource attributes based on app data
	// @ts-ignore
	openTelemetryConfig.resource = new Resource({
		[SemanticResourceAttributes.SERVICE_NAME]: appInfo.systemCode,
		[SemanticResourceAttributes.SERVICE_VERSION]: appInfo.releaseVersion,
		[SemanticResourceAttributes.CLOUD_PROVIDER]: appInfo.cloudProvider,
		[SemanticResourceAttributes.CLOUD_REGION]: appInfo.region,
		[SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: appInfo.environment
	});

	// Auto-instrument common and built-in Node.js modules
	openTelemetryConfig.instrumentations = [
		getNodeAutoInstrumentations({
			'@opentelemetry/instrumentation-fs': {
				enabled: false
			}
		})
	];

	// If we have an OpenTelemetry tracing endpoint then set it up,
	// otherwise we pass a noop span processor so that nothing is exported
	if (tracing?.endpoint) {
		logger.debug({
			event: 'OTEL_TRACE_STATUS',
			message: `OpenTelemetry tracing is enabled and exporting to endpoint ${tracing.endpoint}`,
			enabled: true,
			endpoint: tracing.endpoint
		});
		const headers = {
			'user-agent': TRACING_USER_AGENT
		};
		if (authorizationHeader) {
			headers.authorization = authorizationHeader;
		}
		openTelemetryConfig.traceExporter = new OTLPTraceExporter({
			url: tracing.endpoint,
			headers
		});
	} else {
		logger.warn({
			event: 'OTEL_TRACE_STATUS',
			message:
				'OpenTelemetry tracing is disabled because no tracing endpoint was set',
			enabled: false,
			endpoint: null
		});
		openTelemetryConfig.spanProcessor = new NoopSpanProcessor();
	}

	// Set up and start OpenTelemetry
	const sdk = new opentelemetrySDK.NodeSDK(openTelemetryConfig);
	sdk.start();
}

module.exports = setupOpenTelemetry;

// @ts-ignore
module.exports.default = module.exports;
