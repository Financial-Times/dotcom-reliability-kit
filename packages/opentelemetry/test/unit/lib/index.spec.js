jest.mock('../../../package.json', () => ({
	name: 'mock-package',
	version: '1.2.3'
}));
jest.mock('@opentelemetry/auto-instrumentations-node');
jest.mock('@opentelemetry/exporter-trace-otlp-proto');
jest.mock('@opentelemetry/exporter-trace-otlp-proto/package.json', () => ({
	name: 'mock-otel-tracing-package',
	version: '3.4.5'
}));
jest.mock('@opentelemetry/sdk-trace-base');
jest.mock('@opentelemetry/sdk-node');
jest.mock('@dotcom-reliability-kit/app-info');
jest.mock('@opentelemetry/api');
jest.mock('@dotcom-reliability-kit/logger');
jest.mock('@dotcom-reliability-kit/log-error');
jest.mock('@dotcom-reliability-kit/errors');
jest.mock('../../../lib/config/resource', () => ({
	createResourceConfig: jest.fn().mockReturnValue('mock-resource')
}));

const { createResourceConfig } = require('../../../lib/config/resource');
const { diag, DiagLogLevel } = require('@opentelemetry/api');
const {
	getNodeAutoInstrumentations
} = require('@opentelemetry/auto-instrumentations-node');
const logger = require('@dotcom-reliability-kit/logger');
const { logRecoverableError } = require('@dotcom-reliability-kit/log-error');
const { UserInputError } = require('@dotcom-reliability-kit/errors');
const opentelemetrySDK = require('@opentelemetry/sdk-node');
const appInfo = require('@dotcom-reliability-kit/app-info');
const {
	OTLPTraceExporter
} = require('@opentelemetry/exporter-trace-otlp-proto');
const {
	NoopSpanProcessor,
	TraceIdRatioBasedSampler
} = require('@opentelemetry/sdk-trace-base');

// Set up the mock
appInfo.systemCode = 'MOCK_SYSTEM_CODE';
appInfo.releaseVersion = 'MOCK_RELEASE_VERSION';
appInfo.cloudProvider = 'MOCK_CLOUD_PROVIDER';
appInfo.region = 'MOCK_CLOUD_REGION';
appInfo.environment = 'MOCK_ENVIRONMENT';

logger.createChildLogger.mockReturnValue('mock child logger');
DiagLogLevel.INFO = 'mock info log level';
getNodeAutoInstrumentations.mockReturnValue('mock implementation response');

// Import the OTel function for testing
const openTelemetryTracing = require('../../../lib/index');

describe('@dotcom-reliability-kit/opentelemetry', () => {
	it('should be exporting a function', () => {
		expect(typeof openTelemetryTracing).toStrictEqual('function');
	});

	describe('OpenTelemetry is set up correctly', () => {
		beforeAll(() => {
			openTelemetryTracing({ tracing: { endpoint: 'MOCK_TRACING_ENDPOINT' } });
		});

		it('sets up OpenTelemetry to log via Reliability Kit logger', () => {
			expect(logger.createChildLogger).toHaveBeenCalledTimes(1);
			expect(logger.createChildLogger).toHaveBeenCalledWith({
				event: 'OTEL_INTERNALS'
			});
			expect(diag.setLogger).toHaveBeenCalledTimes(1);
			expect(diag.setLogger).toHaveBeenCalledWith(
				'mock child logger',
				'mock info log level'
			);
		});

		it('calls and starts the OpenTelemetry Node SDK', () => {
			expect(opentelemetrySDK.NodeSDK).toHaveBeenCalledTimes(1);
			expect(opentelemetrySDK.NodeSDK).toHaveBeenCalledWith(expect.any(Object));
			expect(opentelemetrySDK.NodeSDK.prototype.start).toHaveBeenCalledTimes(1);
		});

		it('configures the OpenTelemetry resource', () => {
			expect(createResourceConfig).toHaveBeenCalledTimes(1);
			expect(createResourceConfig).toHaveBeenCalledWith();
			expect(opentelemetrySDK.NodeSDK.mock.calls[0][0].resource).toStrictEqual(
				'mock-resource'
			);
		});

		it('sets OpenTelemetry instrumentations by auto-instrumenting common and built-in Node.js modules', () => {
			expect(getNodeAutoInstrumentations).toHaveBeenCalledTimes(1);
			expect(getNodeAutoInstrumentations).toHaveBeenCalledWith({
				'@opentelemetry/instrumentation-http': {
					ignoreIncomingRequestHook: expect.any(Function)
				},
				'@opentelemetry/instrumentation-fs': {
					enabled: false
				}
			});
			expect(
				opentelemetrySDK.NodeSDK.mock.calls[0][0].instrumentations
			).toEqual(expect.arrayContaining(['mock implementation response']));
		});

		it('creates traces via an instantiated OTLPTraceExporter', () => {
			expect(OTLPTraceExporter).toHaveBeenCalledTimes(1);
			expect(OTLPTraceExporter).toHaveBeenCalledWith({
				url: 'MOCK_TRACING_ENDPOINT',
				headers: {
					'user-agent':
						'FTSystem/MOCK_SYSTEM_CODE (mock-package/1.2.3) (mock-otel-tracing-package/3.4.5)'
				}
			});
			expect(
				opentelemetrySDK.NodeSDK.mock.calls[0][0].traceExporter
			).toBeInstanceOf(OTLPTraceExporter);
		});

		it('creates a ratio-based sampler and sets a sample rate for OpenTelemetry', () => {
			expect(TraceIdRatioBasedSampler).toHaveBeenCalledTimes(1);
			expect(TraceIdRatioBasedSampler).toHaveBeenCalledWith(0.05); // The default
			expect(opentelemetrySDK.NodeSDK.mock.calls[0][0].sampler).toBeInstanceOf(
				TraceIdRatioBasedSampler
			);
		});

		it('logs that tracing is enabled', () => {
			expect(logger.info).toHaveBeenCalledWith({
				enabled: true,
				endpoint: 'MOCK_TRACING_ENDPOINT',
				event: 'OTEL_TRACE_STATUS',
				message:
					'OpenTelemetry tracing is enabled and exporting to endpoint MOCK_TRACING_ENDPOINT',
				samplePercentage: 5
			});
		});

		it('it does not create traces via an instantiated NoopSpanProcessor', () => {
			expect(NoopSpanProcessor).toHaveBeenCalledTimes(0);
		});

		describe('ignoreIncomingRequestHook filter', () => {
			let ignoreIncomingRequestHook;

			beforeAll(() => {
				ignoreIncomingRequestHook =
					getNodeAutoInstrumentations.mock.calls[0][0][
						'@opentelemetry/instrumentation-http'
					].ignoreIncomingRequestHook;
			});

			it('returns `true` with a request to `/__gtg`', () => {
				const mockRequest = {
					url: '/__gtg?a=b',
					headers: { host: 'mock-host' }
				};
				expect(ignoreIncomingRequestHook(mockRequest)).toBe(true);
			});

			it('returns `true` with a request to `/__health`', () => {
				const mockRequest = {
					url: '/__health?a=b',
					headers: { host: 'mock-host' }
				};
				expect(ignoreIncomingRequestHook(mockRequest)).toBe(true);
			});

			it('returns `true` with a request to `/favicon.ico`', () => {
				const mockRequest = {
					url: '/favicon.ico?a=b',
					headers: { host: 'mock-host' }
				};
				expect(ignoreIncomingRequestHook(mockRequest)).toBe(true);
			});

			it('returns `false` with a request to anything else', () => {
				const mockRequest = {
					url: '/mock-endpoint',
					headers: { host: 'mock-host' }
				};
				expect(ignoreIncomingRequestHook(mockRequest)).toBe(false);
			});

			it('returns `false` when a request URL is not present', () => {
				const mockRequest = {
					url: undefined,
					headers: { host: 'mock-host' }
				};
				expect(ignoreIncomingRequestHook(mockRequest)).toBe(false);
			});

			it("doesn't throw when the host header isn't set", () => {
				const mockRequest = {
					url: '/mock-endpoint',
					headers: {}
				};
				expect(() => ignoreIncomingRequestHook(mockRequest)).not.toThrow();
			});

			it('logs a warning and returns `false` when a request URL cannot be parsed', () => {
				const mockRequest = {
					url: '/mock-endpont',
					headers: { host: '' }
				};
				expect(ignoreIncomingRequestHook(mockRequest)).toBe(false);
				expect(UserInputError).toHaveBeenCalledTimes(1);
				expect(UserInputError).toHaveBeenCalledWith(
					expect.objectContaining({
						code: 'OTEL_REQUEST_FILTER_FAILURE'
					})
				);
				expect(logRecoverableError).toHaveBeenCalledTimes(1);
				expect(logRecoverableError).toHaveBeenCalledWith(
					expect.objectContaining({
						error: expect.any(UserInputError),
						includeHeaders: ['host'],
						request: mockRequest
					})
				);
			});
		});
	});

	describe('when an authorization header is passed into the options', () => {
		beforeAll(() => {
			OTLPTraceExporter.mockReset();
			openTelemetryTracing({
				tracing: { endpoint: 'MOCK_TRACING_ENDPOINT' },
				authorizationHeader: 'mock-authorization-header'
			});
		});

		it('instantiates the OTLPTraceExporter with the authorization header set', () => {
			expect(OTLPTraceExporter).toHaveBeenCalledTimes(1);
			expect(OTLPTraceExporter).toHaveBeenCalledWith({
				url: 'MOCK_TRACING_ENDPOINT',
				headers: {
					authorization: 'mock-authorization-header',
					'user-agent':
						'FTSystem/MOCK_SYSTEM_CODE (mock-package/1.2.3) (mock-otel-tracing-package/3.4.5)'
				}
			});
		});
	});

	describe('when a sample percentage is passed into the options', () => {
		beforeAll(() => {
			opentelemetrySDK.NodeSDK.mockReset();
			TraceIdRatioBasedSampler.mockReset();
			openTelemetryTracing({
				tracing: { endpoint: 'MOCK_TRACING_ENDPOINT', samplePercentage: 50 }
			});
		});

		it('sets a sample rate for OpenTelemetry based on the value', () => {
			expect(TraceIdRatioBasedSampler).toHaveBeenCalledTimes(1);
			// The value of `samplePercentage` divided by 100
			expect(TraceIdRatioBasedSampler).toHaveBeenCalledWith(0.5);
			expect(opentelemetrySDK.NodeSDK.mock.calls[0][0].sampler).toBeInstanceOf(
				TraceIdRatioBasedSampler
			);
		});
	});

	describe('spans are not created and exported if param is not a traces endpoint', () => {
		beforeAll(() => {
			opentelemetrySDK.NodeSDK.mockReset();
			OTLPTraceExporter.mockReset();
			openTelemetryTracing({ tracing: undefined });
		});

		it('instantiates the NoopSpanProcessor if param is not a traces endpoint', () => {
			expect(NoopSpanProcessor).toHaveBeenCalledTimes(1);
			expect(
				opentelemetrySDK.NodeSDK.mock.calls[0][0].spanProcessor
			).toBeInstanceOf(NoopSpanProcessor);
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

		it('it does not create traces via an instantiated OTLPTraceExporter', () => {
			expect(OTLPTraceExporter).toHaveBeenCalledTimes(0);
		});
	});

	it('executes when no param is passed in (as params are optional)', () => {
		openTelemetryTracing();
	});

	describe('when OTEL_ environment variables are defined', () => {
		beforeAll(() => {
			process.env.OTEL_MOCK = 'mock';
			openTelemetryTracing();
		});

		it('logs a warning that these environment variables are not supported', () => {
			expect(logger.warn).toHaveBeenCalledWith({
				event: 'OTEL_ENVIRONMENT_VARIABLES_DEFINED',
				message:
					'OTEL-prefixed environment variables are defined, this use-case is not supported by Reliability Kit. You may encounter issues'
			});
		});
	});
});
