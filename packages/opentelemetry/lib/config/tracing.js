const {
	OTLPTraceExporter
} = require('@opentelemetry/exporter-trace-otlp-proto');
const { NoopSpanProcessor, TraceIdRatioBasedSampler } =
	require('@opentelemetry/sdk-node').tracing;

const logger = require('@dotcom-reliability-kit/logger');
const { TRACING_USER_AGENT } = require('./user-agents');

const DEFAULT_SAMPLE_PERCENTAGE = 5;

/**
 * @typedef {object} TracingOptions
 * @property {string} [authorizationHeader]
 *     The HTTP `Authorization` header to send with OpenTelemetry tracing requests if you're using the Customer Products trace collector endpoint.
 * @property {string} [endpoint]
 *     The URL to send OpenTelemetry trace segments to, for example http://localhost:4318/v1/traces.
 * @property {number} [samplePercentage]
 *     What percentage of traces should be sent onto the collector.
 */

/**
 * Create an OpenTelemetry tracing configuration.
 *
 * @param {TracingOptions} options
 * @returns {Partial<import('@opentelemetry/sdk-node').NodeSDKConfiguration>}
 */
exports.createTracingConfig = function createTracingConfig(options) {
	/** @type {Partial<import('@opentelemetry/sdk-node').NodeSDKConfiguration>} */
	const config = {};

	// If we have an OpenTelemetry tracing endpoint then set it up,
	// otherwise we pass a noop span processor so that nothing is exported
	if (options?.endpoint) {
		const headers = {
			'user-agent': TRACING_USER_AGENT
		};
		if (options.authorizationHeader) {
			headers.authorization = options.authorizationHeader;
		}
		config.traceExporter = new OTLPTraceExporter({
			url: options.endpoint,
			headers
		});

		// Sample traces
		let samplePercentage = DEFAULT_SAMPLE_PERCENTAGE;
		if (options.samplePercentage && !Number.isNaN(options.samplePercentage)) {
			samplePercentage = options.samplePercentage;
		}
		const sampleRatio = samplePercentage / 100;
		config.sampler = new TraceIdRatioBasedSampler(sampleRatio);

		logger.info({
			event: 'OTEL_TRACE_STATUS',
			message: `OpenTelemetry tracing is enabled and exporting to endpoint ${options.endpoint}`,
			enabled: true,
			endpoint: options.endpoint,
			samplePercentage
		});
	} else {
		logger.info({
			event: 'OTEL_TRACE_STATUS',
			message:
				'OpenTelemetry tracing is disabled because no tracing endpoint was set',
			enabled: false,
			endpoint: null
		});
		config.spanProcessors = [new NoopSpanProcessor()];
	}

	return config;
};
