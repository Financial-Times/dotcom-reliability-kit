jest.mock('@opentelemetry/sdk-node');
jest.mock('@opentelemetry/api');
jest.mock('@dotcom-reliability-kit/logger');
jest.mock('../../../lib/config/instrumentations', () => ({
	createInstrumentationConfig: jest
		.fn()
		.mockReturnValue('mock-instrumentations')
}));
jest.mock('../../../lib/config/metrics', () => ({
	createMetricsConfig: jest.fn().mockReturnValue({ metrics: 'mock-metrics' })
}));
jest.mock('../../../lib/config/resource', () => ({
	createResourceConfig: jest.fn().mockReturnValue('mock-resource')
}));
jest.mock('../../../lib/config/tracing', () => ({
	createTracingConfig: jest.fn().mockReturnValue({ tracing: 'mock-tracing' })
}));

const {
	createInstrumentationConfig
} = require('../../../lib/config/instrumentations');
const { createMetricsConfig } = require('../../../lib/config/metrics');
const { createResourceConfig } = require('../../../lib/config/resource');
const { createTracingConfig } = require('../../../lib/config/tracing');
const { diag, DiagLogLevel } = require('@opentelemetry/api');
const { NodeSDK } = require('@opentelemetry/sdk-node');
const logger = require('@dotcom-reliability-kit/logger');

logger.createChildLogger.mockReturnValue('mock child logger');
DiagLogLevel.INFO = 'mock info log level';

// Import the OTel function for testing
const setupOpenTelemetry = require('../../../lib/index');

describe('@dotcom-reliability-kit/opentelemetry', () => {
	it('exports a function', () => {
		expect(typeof setupOpenTelemetry).toStrictEqual('function');
	});

	describe('setupOpenTelemetry(options)', () => {
		beforeAll(() => {
			setupOpenTelemetry({
				tracing: {
					endpoint: 'mock-tracing-endpoint',
					samplePercentage: 137
				},
				metrics: {
					endpoint: 'mock-metrics-endpoint'
				}
			});
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

		it('configures the OpenTelemetry instrumentations', () => {
			expect(createInstrumentationConfig).toHaveBeenCalledTimes(1);
			expect(createInstrumentationConfig).toHaveBeenCalledWith();
		});

		it('configures the OpenTelemetry resource', () => {
			expect(createResourceConfig).toHaveBeenCalledTimes(1);
			expect(createResourceConfig).toHaveBeenCalledWith();
		});

		it('creates tracing config', () => {
			expect(createTracingConfig).toHaveBeenCalledTimes(1);
			expect(createTracingConfig).toHaveBeenCalledWith({
				endpoint: 'mock-tracing-endpoint',
				samplePercentage: 137
			});
		});

		it('creates metrics config', () => {
			expect(createMetricsConfig).toHaveBeenCalledTimes(1);
			expect(createMetricsConfig).toHaveBeenCalledWith({
				endpoint: 'mock-metrics-endpoint'
			});
		});

		it('instantiates and starts the OpenTelemetry Node SDK with the created config', () => {
			expect(NodeSDK).toHaveBeenCalledTimes(1);
			expect(NodeSDK).toHaveBeenCalledWith({
				instrumentations: 'mock-instrumentations',
				resource: 'mock-resource',
				tracing: 'mock-tracing',
				metrics: 'mock-metrics'
			});
			expect(NodeSDK.prototype.start).toHaveBeenCalledTimes(1);
		});

		describe('when no options are set', () => {
			beforeAll(() => {
				NodeSDK.mockClear();
				setupOpenTelemetry();
			});

			it('still instantiates and starts the OpenTelemetry Node SDK with the created config', () => {
				expect(NodeSDK).toHaveBeenCalledTimes(1);
				expect(NodeSDK).toHaveBeenCalledWith({
					instrumentations: 'mock-instrumentations',
					resource: 'mock-resource',
					tracing: 'mock-tracing',
					metrics: 'mock-metrics'
				});
			});
		});

		describe('when an authorization header is passed into the root options (deprecated)', () => {
			beforeAll(() => {
				createTracingConfig.mockReset();
				setupOpenTelemetry({
					authorizationHeader: 'mock-authorization-header-root',
					tracing: {
						endpoint: 'mock-tracing-endpoint'
					}
				});
			});

			it('uses the authorization header when configuring tracing', () => {
				expect(createTracingConfig).toHaveBeenCalledTimes(1);
				expect(createTracingConfig).toHaveBeenCalledWith({
					authorizationHeader: 'mock-authorization-header-root',
					endpoint: 'mock-tracing-endpoint'
				});
			});
		});

		describe('when an authorization header is passed into the tracing options', () => {
			beforeAll(() => {
				createTracingConfig.mockReset();
				setupOpenTelemetry({
					tracing: {
						authorizationHeader: 'mock-authorization-header-tracing',
						endpoint: 'mock-tracing-endpoint'
					}
				});
			});

			it('uses the authorization header when configuring tracing', () => {
				expect(createTracingConfig).toHaveBeenCalledTimes(1);
				expect(createTracingConfig).toHaveBeenCalledWith({
					authorizationHeader: 'mock-authorization-header-tracing',
					endpoint: 'mock-tracing-endpoint'
				});
			});
		});

		describe('when an authorization header is passed into both the root options (deprecated) and tracing options', () => {
			beforeAll(() => {
				createTracingConfig.mockReset();
				setupOpenTelemetry({
					authorizationHeader: 'mock-authorization-header-root',
					tracing: {
						authorizationHeader: 'mock-authorization-header-tracing',
						endpoint: 'mock-tracing-endpoint'
					}
				});
			});

			it('prioritises the tracing option authorization header', () => {
				expect(createTracingConfig).toHaveBeenCalledTimes(1);
				expect(createTracingConfig).toHaveBeenCalledWith({
					authorizationHeader: 'mock-authorization-header-tracing',
					endpoint: 'mock-tracing-endpoint'
				});
			});
		});

		describe('when OTEL_ environment variables are defined', () => {
			beforeAll(() => {
				process.env.OTEL_MOCK = 'mock';
				setupOpenTelemetry();
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
});
