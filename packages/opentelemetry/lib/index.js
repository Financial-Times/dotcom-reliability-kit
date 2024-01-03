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
const { NoopSpanProcessor } = require('@opentelemetry/sdk-trace-base');
const logger = require('@dotcom-reliability-kit/logger');

/**
 * Set up OpenTelemetry tracing.
 *
 * @param {object} [options]
 *      Options passed into the function parameter.
 * @param {string | null} [options.tracesEndpoint]
 *      The URL to send OpenTelemetry trace segments to, for example http://localhost:4318/v1/traces.
 */
function setupOpenTelemetry({ tracesEndpoint } = {}) {
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

	// If we have an OpenTelemetry traces endpoint then set it up,
	// otherwise we pass a noop span processor so that nothing is exported
	if (tracesEndpoint) {
		logger.debug({
			event: 'OTEL_TRACE_STATUS',
			message: `OpenTelemetry tracing is enabled and exporting to endpoint ${tracesEndpoint}`,
			enabled: true,
			tracesEndpoint: tracesEndpoint
		});
		openTelemetryConfig.traceExporter = new OTLPTraceExporter({
			url: tracesEndpoint
		});
	} else {
		logger.warn({
			event: 'OTEL_TRACE_STATUS',
			message:
				'OpenTelemetry tracing is disabled because no OPENTELEMETRY_TRACES_ENDPOINT environment variable was set',
			enabled: false
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
