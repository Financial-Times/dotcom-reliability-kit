const { before, describe, it, mock } = require('node:test');
const assert = require('node:assert/strict');

const logger = { info: mock.fn() };
mock.module('@dotcom-reliability-kit/logger', { defaultExport: logger });

mock.module('../../../../lib/config/user-agents.js', {
	namedExports: { TRACING_USER_AGENT: 'mock-tracing-user-agent' }
});

const OTLPTraceExporter = mock.fn(class OTLPTraceExporter {});
mock.module('@opentelemetry/exporter-trace-otlp-proto', { namedExports: { OTLPTraceExporter } });

const NoopSpanProcessor = mock.fn(class NoopSpanProcessor {});
const TraceIdRatioBasedSampler = mock.fn(class TraceIdRatioBasedSampler {});
mock.module('@opentelemetry/sdk-node', {
	namedExports: { tracing: { NoopSpanProcessor, TraceIdRatioBasedSampler } }
});

const { createTracingConfig } = require('../../../../lib/config/tracing.js');

describe('@dotcom-reliability-kit/opentelemetry/lib/config/tracing', () => {
	it('exports a function', () => {
		assert.strictEqual(typeof createTracingConfig, 'function');
	});

	describe('createTracingConfig(options)', () => {
		let config;

		before(() => {
			config = createTracingConfig({
				authorizationHeader: 'mock-auth-header',
				endpoint: 'mock-endpoint',
				samplePercentage: 10
			});
		});

		it('creates a trace exporter', () => {
			assert.strictEqual(OTLPTraceExporter.mock.callCount(), 1);
			assert.ok(OTLPTraceExporter.mock.calls[0].target);
			assert.deepStrictEqual(OTLPTraceExporter.mock.calls[0].arguments, [
				{
					url: 'mock-endpoint',
					headers: {
						authorization: 'mock-auth-header',
						'user-agent': 'mock-tracing-user-agent'
					}
				}
			]);
		});

		it('creates a ratio-based trace sampler', () => {
			assert.strictEqual(TraceIdRatioBasedSampler.mock.callCount(), 1);
			assert.deepStrictEqual(TraceIdRatioBasedSampler.mock.calls[0].arguments, [0.1]);
		});

		it('does not create a noop span processor', () => {
			assert.strictEqual(NoopSpanProcessor.mock.callCount(), 0);
		});

		it('logs that tracing is enabled', () => {
			assert.strictEqual(logger.info.mock.callCount(), 1);
			assert.deepStrictEqual(logger.info.mock.calls[0].arguments, [
				{
					enabled: true,
					endpoint: 'mock-endpoint',
					event: 'OTEL_TRACE_STATUS',
					message:
						'OpenTelemetry tracing is enabled and exporting to endpoint mock-endpoint',
					samplePercentage: 10
				}
			]);
		});

		it('returns the configuration', () => {
			assert.deepStrictEqual(config, {
				traceExporter: OTLPTraceExporter.mock.calls[0].result,
				sampler: TraceIdRatioBasedSampler.mock.calls[0].result
			});
		});

		describe('when options.authorizationHeader is not defined', () => {
			before(() => {
				OTLPTraceExporter.mock.resetCalls();
				config = createTracingConfig({
					endpoint: 'mock-endpoint',
					samplePercentage: 10
				});
			});

			it('creates a trace exporter without an authorization header', () => {
				assert.strictEqual(OTLPTraceExporter.mock.callCount(), 1);
				assert.ok(OTLPTraceExporter.mock.calls[0].target);
				assert.deepStrictEqual(OTLPTraceExporter.mock.calls[0].arguments, [
					{
						url: 'mock-endpoint',
						headers: {
							'user-agent': 'mock-tracing-user-agent'
						}
					}
				]);
			});
		});

		describe('when options.samplePercentage is not defined', () => {
			before(() => {
				TraceIdRatioBasedSampler.mock.resetCalls();
				config = createTracingConfig({
					authorizationHeader: 'mock-auth-header',
					endpoint: 'mock-endpoint'
				});
			});

			it('creates a ratio-based trace sampler with a default sample ratio', () => {
				assert.strictEqual(TraceIdRatioBasedSampler.mock.callCount(), 1);
				assert.deepStrictEqual(TraceIdRatioBasedSampler.mock.calls[0].arguments, [0.05]);
			});
		});

		describe('when options.endpoint is not defined', () => {
			before(() => {
				logger.info.mock.resetCalls();
				OTLPTraceExporter.mock.resetCalls();
				TraceIdRatioBasedSampler.mock.resetCalls();
				config = createTracingConfig({});
			});

			it('does not creates a trace exporter', () => {
				assert.strictEqual(OTLPTraceExporter.mock.callCount(), 0);
			});

			it('does not create a ratio-based trace sampler', () => {
				assert.strictEqual(TraceIdRatioBasedSampler.mock.callCount(), 0);
			});

			it('creates a noop span processor', () => {
				assert.strictEqual(NoopSpanProcessor.mock.callCount(), 1);
				assert.ok(NoopSpanProcessor.mock.calls[0].target);
				assert.deepStrictEqual(NoopSpanProcessor.mock.calls[0].arguments, []);
			});

			it('logs that tracing is disabled', () => {
				assert.strictEqual(logger.info.mock.callCount(), 1);
				assert.deepStrictEqual(logger.info.mock.calls[0].arguments, [
					{
						enabled: false,
						endpoint: null,
						event: 'OTEL_TRACE_STATUS',
						message:
							'OpenTelemetry tracing is disabled because no tracing endpoint was set'
					}
				]);
			});

			it('returns the configuration', () => {
				assert.deepStrictEqual(config, {
					spanProcessors: [NoopSpanProcessor.mock.calls[0].result]
				});
			});
		});
	});
});
