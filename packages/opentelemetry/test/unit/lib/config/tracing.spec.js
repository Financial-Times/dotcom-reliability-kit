jest.mock('@opentelemetry/exporter-trace-otlp-proto');
jest.mock('@opentelemetry/sdk-trace-base');
jest.mock('@dotcom-reliability-kit/logger');
jest.mock('../../../../lib/config/user-agents', () => ({
	TRACING_USER_AGENT: 'mock-tracing-user-agent'
}));

const logger = require('@dotcom-reliability-kit/logger');
const {
	OTLPTraceExporter
} = require('@opentelemetry/exporter-trace-otlp-proto');
const {
	NoopSpanProcessor,
	TraceIdRatioBasedSampler
} = require('@opentelemetry/sdk-trace-base');
const { createTracingConfig } = require('../../../../lib/config/tracing');

describe('@dotcom-reliability-kit/opentelemetry/lib/config/tracing', () => {
	it('exports a function', () => {
		expect(typeof createTracingConfig).toBe('function');
	});

	describe('createTracingConfig(options)', () => {
		let config;

		beforeAll(() => {
			config = createTracingConfig({
				authorizationHeader: 'mock-auth-header',
				endpoint: 'mock-endpoint',
				samplePercentage: 10
			});
		});

		it('creates a trace exporter', () => {
			expect(OTLPTraceExporter).toHaveBeenCalledTimes(1);
			expect(OTLPTraceExporter).toHaveBeenCalledWith({
				url: 'mock-endpoint',
				headers: {
					authorization: 'mock-auth-header',
					'user-agent': 'mock-tracing-user-agent'
				}
			});
		});

		it('creates a ratio-based trace sampler', () => {
			expect(TraceIdRatioBasedSampler).toHaveBeenCalledTimes(1);
			expect(TraceIdRatioBasedSampler).toHaveBeenCalledWith(0.1);
		});

		it('does not create a noop span processor', () => {
			expect(NoopSpanProcessor).toHaveBeenCalledTimes(0);
		});

		it('logs that tracing is enabled', () => {
			expect(logger.info).toHaveBeenCalledWith({
				enabled: true,
				endpoint: 'mock-endpoint',
				event: 'OTEL_TRACE_STATUS',
				message:
					'OpenTelemetry tracing is enabled and exporting to endpoint mock-endpoint',
				samplePercentage: 10
			});
		});

		it('returns the configuration', () => {
			expect(config).toEqual({
				traceExporter: OTLPTraceExporter.mock.instances[0],
				sampler: TraceIdRatioBasedSampler.mock.instances[0]
			});
		});

		describe('when options.authorizationHeader is not defined', () => {
			beforeAll(() => {
				OTLPTraceExporter.mockClear();
				config = createTracingConfig({
					endpoint: 'mock-endpoint',
					samplePercentage: 10
				});
			});

			it('creates a trace exporter without an authorization header', () => {
				expect(OTLPTraceExporter).toHaveBeenCalledTimes(1);
				expect(OTLPTraceExporter).toHaveBeenCalledWith({
					url: 'mock-endpoint',
					headers: {
						'user-agent': 'mock-tracing-user-agent'
					}
				});
			});
		});

		describe('when options.samplePercentage is not defined', () => {
			beforeAll(() => {
				TraceIdRatioBasedSampler.mockClear();
				config = createTracingConfig({
					authorizationHeader: 'mock-auth-header',
					endpoint: 'mock-endpoint'
				});
			});

			it('creates a ratio-based trace sampler with a default sample ratio', () => {
				expect(TraceIdRatioBasedSampler).toHaveBeenCalledTimes(1);
				expect(TraceIdRatioBasedSampler).toHaveBeenCalledWith(0.05);
			});
		});

		describe('when options.endpoint is not defined', () => {
			beforeAll(() => {
				OTLPTraceExporter.mockClear();
				TraceIdRatioBasedSampler.mockClear();
				config = createTracingConfig({});
			});

			it('does not creates a trace exporter', () => {
				expect(OTLPTraceExporter).toHaveBeenCalledTimes(0);
			});

			it('does not create a ratio-based trace sampler', () => {
				expect(TraceIdRatioBasedSampler).toHaveBeenCalledTimes(0);
			});

			it('creates a noop span processor', () => {
				expect(NoopSpanProcessor).toHaveBeenCalledTimes(1);
				expect(NoopSpanProcessor).toHaveBeenCalledWith();
			});

			it('logs that tracing is disabled', () => {
				expect(logger.warn).toHaveBeenCalledWith({
					enabled: false,
					endpoint: null,
					event: 'OTEL_TRACE_STATUS',
					message:
						'OpenTelemetry tracing is disabled because no tracing endpoint was set'
				});
			});

			it('returns the configuration', () => {
				expect(config).toEqual({
					spanProcessor: NoopSpanProcessor.mock.instances[0]
				});
			});
		});
	});
});
