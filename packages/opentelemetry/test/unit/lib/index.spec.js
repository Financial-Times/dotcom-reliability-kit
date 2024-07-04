jest.mock('@opentelemetry/host-metrics');
jest.mock('@opentelemetry/sdk-node');
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

describe('@dotcom-reliability-kit/opentelemetry', () => {
	let api;
	let createInstrumentationConfig;
	let createMetricsConfig;
	let createResourceConfig;
	let createTracingConfig;
	let HostMetrics;
	let logger;
	let NodeSDK;
	let opentelemetry;

	// Helper function to reload all modules. We need this because the setup
	// method stores a global singleton so it's impossible to call it multiple
	// times with different configuration values normally. We need to do this
	// in the tests though
	function reloadAllModules() {
		jest.resetModules();
		createInstrumentationConfig =
			require('../../../lib/config/instrumentations').createInstrumentationConfig;
		createMetricsConfig =
			require('../../../lib/config/metrics').createMetricsConfig;
		createResourceConfig =
			require('../../../lib/config/resource').createResourceConfig;
		createTracingConfig =
			require('../../../lib/config/tracing').createTracingConfig;
		api = require('@opentelemetry/sdk-node').api;
		HostMetrics = require('@opentelemetry/host-metrics').HostMetrics;
		NodeSDK = require('@opentelemetry/sdk-node').NodeSDK;
		logger = require('@dotcom-reliability-kit/logger');

		logger.createChildLogger.mockReturnValue('mock child logger');
		api.DiagLogLevel.INFO = 'mock info log level';

		opentelemetry = require('../../../lib/index');
	}

	beforeEach(reloadAllModules);

	describe('.setup(options)', () => {
		let instances;

		beforeEach(() => {
			instances = opentelemetry.setup({
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
			expect(api.diag.setLogger).toHaveBeenCalledTimes(1);
			expect(api.diag.setLogger).toHaveBeenCalledWith(
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

		it('instantiates and starts a HostMetrics collector', () => {
			expect(HostMetrics).toHaveBeenCalledTimes(1);
			expect(HostMetrics).toHaveBeenCalledWith();
			expect(HostMetrics.prototype.start).toHaveBeenCalledTimes(1);
		});

		it('returns the SDK instances', () => {
			expect(instances).toEqual({
				sdk: NodeSDK.mock.instances[0],
				hostMetrics: HostMetrics.mock.instances[0]
			});
		});

		describe('when no metrics endpoint is set', () => {
			beforeEach(() => {
				NodeSDK.mockClear();
				reloadAllModules();
				instances = opentelemetry.setup({
					tracing: {
						endpoint: 'mock-tracing-endpoint',
						samplePercentage: 137
					}
				});
			});

			it('does not instantiate a HostMetrics collector', () => {
				expect(HostMetrics).toHaveBeenCalledTimes(0);
			});

			it('returns instances with hostMetrics undefined', () => {
				expect(instances.hostMetrics).toBeUndefined();
			});
		});

		describe('when no options are set', () => {
			beforeEach(() => {
				NodeSDK.mockClear();
				reloadAllModules();
				opentelemetry.setup();
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
			beforeEach(() => {
				createTracingConfig.mockReset();
				reloadAllModules();
				opentelemetry.setup({
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
			beforeEach(() => {
				createTracingConfig.mockReset();
				reloadAllModules();
				opentelemetry.setup({
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
			beforeEach(() => {
				createTracingConfig.mockReset();
				reloadAllModules();
				opentelemetry.setup({
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
			beforeEach(() => {
				process.env.OTEL_MOCK = 'mock';
				reloadAllModules();
				opentelemetry.setup();
			});

			it('logs a warning that these environment variables are not supported', () => {
				expect(logger.warn).toHaveBeenCalledWith({
					event: 'OTEL_ENVIRONMENT_VARIABLES_DEFINED',
					message:
						'OTEL-prefixed environment variables are defined, this use-case is not supported by Reliability Kit. You may encounter issues'
				});
			});
		});

		describe('when called a second time', () => {
			let returnValue1;
			let returnValue2;

			beforeEach(() => {
				reloadAllModules();
				returnValue1 = opentelemetry.setup({
					tracing: {
						endpoint: 'mock-tracing-endpoint',
						samplePercentage: 137
					},
					metrics: {
						endpoint: 'mock-metrics-endpoint'
					}
				});
				returnValue2 = opentelemetry.setup();
			});

			it('instantiates and starts the OpenTelemetry Node SDK once only', () => {
				expect(NodeSDK).toHaveBeenCalledTimes(1);
				expect(NodeSDK).toHaveBeenCalledWith({
					instrumentations: 'mock-instrumentations',
					resource: 'mock-resource',
					tracing: 'mock-tracing',
					metrics: 'mock-metrics'
				});
				expect(NodeSDK.prototype.start).toHaveBeenCalledTimes(1);
			});

			it('returns the same instances on each call', () => {
				expect(returnValue1).toStrictEqual(returnValue2);
			});
		});
	});

	describe('.getMeter(name, version, options)', () => {
		let meter;

		beforeEach(() => {
			reloadAllModules();
			api.metrics.getMeter.mockReturnValue('mock-meter');
			opentelemetry.setup();
			meter = opentelemetry.getMeter(
				'mock-name',
				'mock-version',
				'mock-options'
			);
		});

		it('creates and returns a global meter', () => {
			expect(api.metrics.getMeter).toHaveBeenCalledTimes(1);
			expect(api.metrics.getMeter).toHaveBeenCalledWith(
				'mock-name',
				'mock-version',
				'mock-options'
			);
			expect(meter).toEqual('mock-meter');
		});

		describe('when OpenTelemetry has not been set up via Reliability Kit', () => {
			beforeEach(() => {
				reloadAllModules();
			});

			it('throws an error', () => {
				expect.hasAssertions();
				try {
					opentelemetry.getMeter('mock-name', 'mock-version', 'mock-options');
				} catch (error) {
					expect(error.code).toEqual('OTEL_MISSING_SETUP');
				}
			});
		});
	});
});
