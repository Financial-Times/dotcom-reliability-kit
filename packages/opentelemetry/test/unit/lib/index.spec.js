const { before, beforeEach, describe, it, mock } = require('node:test');
const assert = require('node:assert/strict');

mock.module('@dotcom-reliability-kit/logger', {
	defaultExport: { createChildLogger: mock.fn(), warn: mock.fn() }
});

mock.module('@opentelemetry/sdk-node', {
	defaultExport: {
		api: {
			diag: { disable: mock.fn(), setLogger: mock.fn() },
			DiagLogLevel: {},
			metrics: {
				getMeter: mock.fn(() => 'mock-meter'),
				getMeterProvider: mock.fn(() => 'mock-meter-provider')
			}
		},
		NodeSDK: mock.fn(
			class NodeSDK {
				start = mock.fn();
			}
		)
	}
});

mock.module('@opentelemetry/host-metrics', {
	namedExports: {
		HostMetrics: mock.fn(
			class HostMetrics {
				start = mock.fn();
			}
		)
	}
});

mock.module('../../../lib/config/instrumentations.js', {
	namedExports: { createInstrumentationConfig: mock.fn(() => 'mock-instrumentations') }
});
mock.module('../../../lib/config/metrics.js', {
	namedExports: { createMetricsConfig: mock.fn(() => ({ metrics: 'mock-metrics' })) }
});
mock.module('../../../lib/config/resource.js', {
	namedExports: { createResourceConfig: mock.fn(() => 'mock-resource') }
});
mock.module('../../../lib/config/tracing.js', {
	namedExports: { createTracingConfig: mock.fn(() => ({ tracing: 'mock-tracing' })) }
});
mock.module('../../../lib/config/views.js', {
	namedExports: { createViewConfig: mock.fn(() => ({ views: 'mock-views' })) }
});

describe('@dotcom-reliability-kit/opentelemetry', () => {
	let api;
	let createInstrumentationConfig;
	let createMetricsConfig;
	let createResourceConfig;
	let createTracingConfig;
	let createViewConfig;
	let HostMetrics;
	let logger;
	let mockChildLogger;
	let NodeSDK;
	let opentelemetry;

	// Helper function to reload all modules. We need this because the setup
	// method stores a global singleton so it's impossible to call it multiple
	// times with different configuration values normally. We need to do this
	// in the tests though
	function reloadAllModules() {
		createInstrumentationConfig =
			require('../../../lib/config/instrumentations.js').createInstrumentationConfig;
		createMetricsConfig = require('../../../lib/config/metrics.js').createMetricsConfig;
		createResourceConfig = require('../../../lib/config/resource.js').createResourceConfig;
		createTracingConfig = require('../../../lib/config/tracing.js').createTracingConfig;
		createViewConfig = require('../../../lib/config/views.js').createViewConfig;
		api = require('@opentelemetry/sdk-node').api;
		HostMetrics = require('@opentelemetry/host-metrics').HostMetrics;
		NodeSDK = require('@opentelemetry/sdk-node').NodeSDK;
		logger = require('@dotcom-reliability-kit/logger');

		mockChildLogger = {
			debug: mock.fn(),
			error: mock.fn(),
			info: mock.fn(),
			verbose: mock.fn(),
			warn: mock.fn()
		};
		logger.createChildLogger.mock.mockImplementation(() => mockChildLogger);
		api.DiagLogLevel.INFO = 'mock info log level';

		delete require.cache[require.resolve('../../../lib/index.js')];
		opentelemetry = require('../../../lib/index.js');
	}

	before(reloadAllModules);

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
				},
				views: {
					httpServerDurationBuckets: 'mock-http-duration-buckets'
				}
			});
		});

		it('disables the internal OpenTelemetry logger', () => {
			assert.strictEqual(api.diag.disable.mock.callCount(), 1);
			assert.strictEqual(logger.createChildLogger.mock.callCount(), 0);
			assert.strictEqual(api.diag.setLogger.mock.callCount(), 0);
		});

		it('configures the OpenTelemetry instrumentations', () => {
			assert.strictEqual(createInstrumentationConfig.mock.callCount(), 1);
			assert.deepStrictEqual(createInstrumentationConfig.mock.calls[0].arguments, []);
		});

		it('configures the OpenTelemetry resource', () => {
			assert.strictEqual(createResourceConfig.mock.callCount(), 1);
			assert.deepStrictEqual(createResourceConfig.mock.calls[0].arguments, []);
		});

		it('creates tracing config', () => {
			assert.strictEqual(createTracingConfig.mock.callCount(), 1);
			assert.deepStrictEqual(createTracingConfig.mock.calls[0].arguments, [
				{
					authorizationHeader: undefined,
					endpoint: 'mock-tracing-endpoint',
					samplePercentage: 137
				}
			]);
		});

		it('creates metrics config', () => {
			assert.strictEqual(createMetricsConfig.mock.callCount(), 1);
			assert.deepStrictEqual(createMetricsConfig.mock.calls[0].arguments, [
				{
					endpoint: 'mock-metrics-endpoint'
				}
			]);
		});

		it('creates views config', () => {
			assert.strictEqual(createViewConfig.mock.callCount(), 1);
			assert.deepStrictEqual(createViewConfig.mock.calls[0].arguments, [
				{
					httpServerDurationBuckets: 'mock-http-duration-buckets'
				}
			]);
		});

		it('instantiates and starts the OpenTelemetry Node SDK with the created config', () => {
			assert.strictEqual(NodeSDK.mock.callCount(), 1);
			assert.deepStrictEqual(NodeSDK.mock.calls[0].arguments, [
				{
					instrumentations: 'mock-instrumentations',
					resource: 'mock-resource',
					tracing: 'mock-tracing',
					metrics: 'mock-metrics',
					views: 'mock-views'
				}
			]);
			assert.strictEqual(NodeSDK.mock.calls[0].result.start.mock.callCount(), 1);
		});

		it('instantiates and starts a HostMetrics collector', () => {
			assert.strictEqual(HostMetrics.mock.callCount(), 1);
			assert.deepStrictEqual(HostMetrics.mock.calls[0].arguments, [
				{
					meterProvider: 'mock-meter-provider'
				}
			]);
			assert.strictEqual(HostMetrics.mock.calls[0].result.start.mock.callCount(), 1);
		});

		it('returns the SDK instances', () => {
			assert.deepStrictEqual(instances, {
				sdk: NodeSDK.mock.calls[0].result,
				hostMetrics: HostMetrics.mock.calls[0].result
			});
		});

		describe('when the logInternals option is set', () => {
			before(() => {
				api.diag.disable.mock.resetCalls();
				logger.createChildLogger.mock.resetCalls();
				NodeSDK.mock.resetCalls();
				reloadAllModules();
				instances = opentelemetry.setup({
					logInternals: true,
					tracing: {
						endpoint: 'mock-tracing-endpoint',
						samplePercentage: 137
					},
					metrics: {
						endpoint: 'mock-metrics-endpoint'
					}
				});
			});

			it('sets up OpenTelemetry to log via a custom logger', () => {
				assert.strictEqual(logger.createChildLogger.mock.callCount(), 1);
				assert.deepStrictEqual(logger.createChildLogger.mock.calls[0].arguments, [
					{
						event: 'OTEL_INTERNALS'
					}
				]);
				assert.strictEqual(api.diag.setLogger.mock.callCount(), 1);
				assert.notDeepStrictEqual(api.diag.setLogger.mock.calls[0].arguments, [
					mockChildLogger
				]);
				assert.partialDeepStrictEqual(api.diag.setLogger.mock.calls[0].arguments, [{}]);
				const setLogger = api.diag.setLogger.mock.calls[0].arguments[0];
				for (const value of Object.values(setLogger)) {
					assert.strictEqual(typeof value, 'function');
				}
				assert.partialDeepStrictEqual(api.diag.setLogger.mock.calls[0].arguments, [{}]);
				assert.strictEqual(api.diag.disable.mock.callCount(), 0);
			});

			describe('custom logger', () => {
				let customLogger;

				beforeEach(() => {
					customLogger = api.diag.setLogger.mock.calls[0].arguments[0];
				});

				describe('.debug()', () => {
					it('does nothing', () => {
						customLogger.debug('mock message 1', 'mock message 2');
						assert.strictEqual(mockChildLogger.debug.mock.callCount(), 0);
					});
				});

				describe('.error()', () => {
					it('logs an error via the Reliability Kit child logger', () => {
						customLogger.error('mock message 1', 'mock message 2');
						assert.strictEqual(mockChildLogger.error.mock.callCount(), 1);
						assert.deepStrictEqual(mockChildLogger.error.mock.calls[0].arguments, [
							'mock message 1',
							{
								details: ['mock message 2']
							}
						]);
					});
				});

				describe('.info()', () => {
					it('logs info via the Reliability Kit child logger', () => {
						customLogger.info('mock message 1', 'mock message 2');
						assert.strictEqual(mockChildLogger.info.mock.callCount(), 1);
						assert.deepStrictEqual(mockChildLogger.info.mock.calls[0].arguments, [
							'mock message 1',
							{
								details: ['mock message 2']
							}
						]);
					});
				});

				describe('.verbose()', () => {
					it('does nothing', () => {
						customLogger.verbose('mock message 1', 'mock message 2');
						assert.strictEqual(mockChildLogger.verbose.mock.callCount(), 0);
					});
				});

				describe('.warn()', () => {
					it('logs a warning via the Reliability Kit child logger', () => {
						customLogger.warn('mock message 1', 'mock message 2');
						assert.strictEqual(mockChildLogger.warn.mock.callCount(), 1);
						assert.deepStrictEqual(mockChildLogger.warn.mock.calls[0].arguments, [
							'mock message 1',
							{
								details: ['mock message 2']
							}
						]);
					});
				});
			});
		});

		describe('when no metrics endpoint is set', () => {
			beforeEach(() => {
				HostMetrics.mock.resetCalls();
				reloadAllModules();
				instances = opentelemetry.setup({
					tracing: {
						endpoint: 'mock-tracing-endpoint',
						samplePercentage: 137
					}
				});
			});

			it('does not instantiate a HostMetrics collector', () => {
				assert.strictEqual(HostMetrics.mock.callCount(), 0);
			});

			it('returns instances with hostMetrics undefined', () => {
				assert.strictEqual(instances.hostMetrics, undefined);
			});
		});

		describe('when no options are set', () => {
			beforeEach(() => {
				NodeSDK.mock.resetCalls();
				reloadAllModules();
				opentelemetry.setup();
			});

			it('still instantiates and starts the OpenTelemetry Node SDK with the created config', () => {
				assert.strictEqual(NodeSDK.mock.callCount(), 1);
				assert.deepStrictEqual(NodeSDK.mock.calls[0].arguments, [
					{
						instrumentations: 'mock-instrumentations',
						resource: 'mock-resource',
						tracing: 'mock-tracing',
						metrics: 'mock-metrics',
						views: 'mock-views'
					}
				]);
			});
		});

		describe('when an authorization header is passed into the root options (deprecated)', () => {
			beforeEach(() => {
				createTracingConfig.mock.resetCalls();
				reloadAllModules();
				opentelemetry.setup({
					authorizationHeader: 'mock-authorization-header-root',
					tracing: {
						endpoint: 'mock-tracing-endpoint'
					}
				});
			});

			it('uses the authorization header when configuring tracing', () => {
				assert.strictEqual(createTracingConfig.mock.callCount(), 1);
				assert.deepStrictEqual(createTracingConfig.mock.calls[0].arguments, [
					{
						authorizationHeader: 'mock-authorization-header-root',
						endpoint: 'mock-tracing-endpoint'
					}
				]);
			});
		});

		describe('when an authorization header is passed into the tracing options', () => {
			beforeEach(() => {
				createTracingConfig.mock.resetCalls();
				reloadAllModules();
				opentelemetry.setup({
					tracing: {
						authorizationHeader: 'mock-authorization-header-tracing',
						endpoint: 'mock-tracing-endpoint'
					}
				});
			});

			it('uses the authorization header when configuring tracing', () => {
				assert.strictEqual(createTracingConfig.mock.callCount(), 1);
				assert.deepStrictEqual(createTracingConfig.mock.calls[0].arguments, [
					{
						authorizationHeader: 'mock-authorization-header-tracing',
						endpoint: 'mock-tracing-endpoint'
					}
				]);
			});
		});

		describe('when an authorization header is passed into both the root options (deprecated) and tracing options', () => {
			beforeEach(() => {
				createTracingConfig.mock.resetCalls();
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
				assert.strictEqual(createTracingConfig.mock.callCount(), 1);
				assert.deepStrictEqual(createTracingConfig.mock.calls[0].arguments, [
					{
						authorizationHeader: 'mock-authorization-header-tracing',
						endpoint: 'mock-tracing-endpoint'
					}
				]);
			});
		});

		describe('when OTEL_ environment variables are defined', () => {
			beforeEach(() => {
				process.env.OTEL_MOCK = 'mock';
				reloadAllModules();
				opentelemetry.setup();
			});

			it('logs a warning that these environment variables are not supported', () => {
				assert.deepStrictEqual(logger.warn.mock.calls[0].arguments, [
					{
						event: 'OTEL_ENVIRONMENT_VARIABLES_DEFINED',
						message:
							'OTEL-prefixed environment variables are defined, this use-case is not supported by Reliability Kit. You may encounter issues'
					}
				]);
			});
		});

		describe('when called a second time', () => {
			let returnValue1;
			let returnValue2;

			beforeEach(() => {
				NodeSDK.mock.resetCalls();
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
				assert.strictEqual(NodeSDK.mock.callCount(), 1);
				assert.deepStrictEqual(NodeSDK.mock.calls[0].arguments, [
					{
						instrumentations: 'mock-instrumentations',
						resource: 'mock-resource',
						tracing: 'mock-tracing',
						metrics: 'mock-metrics',
						views: 'mock-views'
					}
				]);
				assert.strictEqual(NodeSDK.mock.calls[0].result.start.mock.callCount(), 1);
			});

			it('returns the same instances on each call', () => {
				assert.strictEqual(returnValue1, returnValue2);
			});
		});
	});

	describe('.getMeter(name, version, options)', () => {
		let meter;

		beforeEach(() => {
			reloadAllModules();
			opentelemetry.setup();
			meter = opentelemetry.getMeter('mock-name', 'mock-version', 'mock-options');
		});

		it('creates and returns a global meter', () => {
			assert.strictEqual(api.metrics.getMeter.mock.callCount(), 1);
			assert.deepStrictEqual(api.metrics.getMeter.mock.calls[0].arguments, [
				'mock-name',
				'mock-version',
				'mock-options'
			]);
			assert.strictEqual(meter, 'mock-meter');
		});

		describe('when OpenTelemetry has not been set up via Reliability Kit', () => {
			beforeEach(() => {
				reloadAllModules();
			});

			it('throws an error', () => {
				try {
					opentelemetry.getMeter('mock-name', 'mock-version', 'mock-options');
					assert.fail('Unreachable: function above should error before this');
				} catch (error) {
					assert.strictEqual(error.code, 'OTEL_MISSING_SETUP');
				}
			});
		});
	});
});
