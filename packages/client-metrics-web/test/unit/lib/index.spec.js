// biome-ignore-all lint/suspicious/noConsole: required because we're in a browser environment

const { afterEach, beforeEach, describe, it, mock } = require('node:test');
const assert = require('node:assert/strict');

const AwsRum = mock.fn(
	class AwsRum {
		enable = mock.fn();
		disable = mock.fn();
		recordError = mock.fn();
		recordEvent = mock.fn();
	}
);
mock.module('aws-rum-web', { namedExports: { AwsRum } });

const { MetricsClient } = require('@dotcom-reliability-kit/client-metrics-web');

describe('@dotcom-reliability-kit/client-metrics-web', () => {
	beforeEach(() => {
		global.window = {
			addEventListener: mock.fn(),
			removeEventListener: mock.fn(),
			location: {
				hostname: 'mock-hostname'
			}
		};
		mock.property(global, 'console', {
			log: console.log,
			warn: mock.fn()
		});
	});

	afterEach(() => {
		delete global.window;
		mock.restoreAll();
		AwsRum.mock.resetCalls();
	});

	it('exports a MetricsClient class', () => {
		assert.ok(MetricsClient instanceof Function);
		assert.throws(() => MetricsClient(), /class constructor/i);
	});

	describe('new MetricsClient(options)', () => {
		let instance;
		let options;

		beforeEach(() => {
			options = {
				allowedHostnamePattern: /^mock-hostname$/,
				awsAppMonitorId: 'mock-app-monitor-id',
				awsAppMonitorRegion: 'mock-app-monitor-region',
				awsIdentityPoolId: 'mock-identity-pool-id',
				samplePercentage: 13,
				systemCode: 'mock-system-code',
				systemVersion: 'mock-version'
			};
			instance = new MetricsClient(options);
		});

		it('creates an AWS RUM client with the given options', () => {
			assert.strictEqual(AwsRum.mock.callCount(), 1);
			assert.strictEqual(typeof AwsRum.mock.calls[0].target, 'function');
			assert.deepStrictEqual(AwsRum.mock.calls[0].arguments, [
				'mock-app-monitor-id',
				'mock-version',
				'mock-app-monitor-region',
				{
					allowCookies: false,
					disableAutoPageView: true,
					enableXRay: false,
					endpoint: `https://dataplane.rum.mock-app-monitor-region.amazonaws.com`,
					identityPoolId: 'mock-identity-pool-id',
					sessionAttributes: { systemCode: 'mock-system-code' },
					sessionSampleRate: 0.13,
					telemetries: ['errors']
				}
			]);
		});

		it('enables the AWS RUM client', () => {
			assert.strictEqual(AwsRum.mock.calls[0].this.enable.mock.callCount(), 1);
		});

		it('adds an "ft.clientMetric" event listener to the window', () => {
			assert.strictEqual(window.addEventListener.mock.callCount(), 1);
			assert.strictEqual(
				window.addEventListener.mock.calls[0].arguments[0],
				'ft.clientMetric'
			);
			assert.strictEqual(
				typeof window.addEventListener.mock.calls[0].arguments[1],
				'function'
			);
		});

		it('does not log any warnings', () => {
			assert.strictEqual(console.warn.mock.callCount(), 0);
		});

		describe('.isAvailable', () => {
			it('is set to true', () => {
				assert.strictEqual(instance.isAvailable, true);
			});
		});

		describe('.isEnabled', () => {
			it('is set to true', () => {
				assert.strictEqual(instance.isEnabled, true);
			});
		});

		describe('.disable()', () => {
			let awsRumInstance;

			beforeEach(() => {
				awsRumInstance = AwsRum.mock.calls[0].this;
				instance.disable();
			});

			it('disables the AWS RUM client', () => {
				assert.strictEqual(awsRumInstance.disable.mock.callCount(), 1);
			});

			it('removes the "ft.clientMetric" event listener from the window', () => {
				assert.strictEqual(window.removeEventListener.mock.callCount(), 1);
				assert.strictEqual(
					window.removeEventListener.mock.calls[0].arguments[0],
					'ft.clientMetric'
				);
				assert.strictEqual(
					typeof window.removeEventListener.mock.calls[0].arguments[1],
					'function'
				);
			});

			it('sets the isEnabled property to false', () => {
				assert.strictEqual(instance.isEnabled, false);
			});

			describe('when the client is already disabled', () => {
				beforeEach(() => {
					awsRumInstance.disable.mock.resetCalls();
					window.removeEventListener.mock.resetCalls();
					instance.disable();
				});

				it('does nothing', () => {
					assert.strictEqual(awsRumInstance.disable.mock.callCount(), 0);
					assert.strictEqual(window.removeEventListener.mock.callCount(), 0);
				});
			});
		});

		describe('.enable()', () => {
			let awsRumInstance;

			beforeEach(() => {
				awsRumInstance = AwsRum.mock.calls[0].this;
				awsRumInstance.enable.mock.resetCalls();
				window.addEventListener.mock.resetCalls();
				instance.disable();
				instance.enable();
			});

			it('re-enables the AWS RUM client', () => {
				assert.strictEqual(awsRumInstance.enable.mock.callCount(), 1);
			});

			it('re-adds the "ft.clientMetric" event listener to the window', () => {
				assert.strictEqual(window.addEventListener.mock.callCount(), 1);
				assert.strictEqual(
					window.addEventListener.mock.calls[0].arguments[0],
					'ft.clientMetric'
				);
				assert.strictEqual(
					typeof window.addEventListener.mock.calls[0].arguments[1],
					'function'
				);
			});

			it('sets the isEnabled property to true', () => {
				assert.strictEqual(instance.isEnabled, true);
			});

			describe('when the client is already enabled', () => {
				beforeEach(() => {
					awsRumInstance.enable.mock.resetCalls();
					window.addEventListener.mock.resetCalls();
					instance.enable();
				});

				it('does nothing', () => {
					assert.strictEqual(awsRumInstance.enable.mock.callCount(), 0);
					assert.strictEqual(window.addEventListener.mock.callCount(), 0);
				});
			});
		});

		describe('.recordError(error)', () => {
			let awsRumInstance;
			let error;

			beforeEach(() => {
				awsRumInstance = AwsRum.mock.calls[0].this;
				error = new Error('mock error');
				instance.recordError(error);
			});

			it('hands the error to the AWS RUM client', () => {
				assert.strictEqual(awsRumInstance.recordError.mock.callCount(), 1);
				assert.deepStrictEqual(awsRumInstance.recordError.mock.calls[0].arguments, [error]);
			});
		});

		describe('.recordEvent(namespace, data)', () => {
			let awsRumInstance;
			let eventData;

			beforeEach(() => {
				awsRumInstance = AwsRum.mock.calls[0].this;
				eventData = { mockEventData: true };
				instance.recordEvent('mock.event', eventData);
			});

			it('hands the event to the AWS RUM client with the namespace prefixed', () => {
				assert.strictEqual(awsRumInstance.recordEvent.mock.callCount(), 1);
				assert.deepStrictEqual(awsRumInstance.recordEvent.mock.calls[0].arguments, [
					'com.ft.mock.event',
					eventData
				]);
			});

			it('does not log any warnings', () => {
				assert.strictEqual(console.warn.mock.callCount(), 0);
			});

			describe('when the namespace includes uppercase characters', () => {
				beforeEach(() => {
					awsRumInstance.recordEvent.mock.resetCalls();
					instance.recordEvent('Mock.UPPER.Event', eventData);
				});

				it('hands the event to the AWS RUM client with the namespace converted to lower case', () => {
					assert.strictEqual(awsRumInstance.recordEvent.mock.callCount(), 1);
					assert.deepStrictEqual(awsRumInstance.recordEvent.mock.calls[0].arguments, [
						'com.ft.mock.upper.event',
						eventData
					]);
				});
			});

			describe('when the namespace is not a string', () => {
				beforeEach(() => {
					awsRumInstance.recordEvent.mock.resetCalls();
					instance.recordEvent(123, eventData);
				});

				it('does not hand the event to the AWS RUM client', () => {
					assert.strictEqual(awsRumInstance.recordEvent.mock.callCount(), 0);
				});

				it('logs a warning about the namespace type', () => {
					assert.strictEqual(console.warn.mock.callCount(), 1);
					assert.deepStrictEqual(console.warn.mock.calls[0].arguments, [
						'Invalid metrics event: namespace (number) must be a string'
					]);
				});
			});

			describe('when the namespace does not include a period', () => {
				beforeEach(() => {
					awsRumInstance.recordEvent.mock.resetCalls();
					instance.recordEvent('mock', eventData);
				});

				it('does not hand the event to the AWS RUM client', () => {
					assert.strictEqual(awsRumInstance.recordEvent.mock.callCount(), 0);
				});

				it('logs a warning about top-level namespaces being reserved', () => {
					assert.strictEqual(console.warn.mock.callCount(), 1);
					assert.deepStrictEqual(console.warn.mock.calls[0].arguments, [
						'Invalid metrics event: namespace ("mock") must include a period, the top level is reserved'
					]);
				});
			});

			describe('when the namespace includes invalid characters', () => {
				beforeEach(() => {
					awsRumInstance.recordEvent.mock.resetCalls();
					instance.recordEvent('mock . namespace', eventData);
				});

				it('does not hand the event to the AWS RUM client', () => {
					assert.strictEqual(awsRumInstance.recordEvent.mock.callCount(), 0);
				});

				it('logs a warning about valid namespace characters', () => {
					assert.strictEqual(console.warn.mock.callCount(), 1);
					assert.deepStrictEqual(console.warn.mock.calls[0].arguments, [
						'Invalid metrics event: namespace ("mock . namespace") must be a combination of alphanumeric characters, underscores, and hyphens, separated by periods'
					]);
				});
			});

			describe('when event data is not defined', () => {
				beforeEach(() => {
					awsRumInstance.recordEvent.mock.resetCalls();
					instance.recordEvent('mock.event');
				});

				it('hands the event to the AWS RUM client with an empty object as event data', () => {
					assert.strictEqual(awsRumInstance.recordEvent.mock.callCount(), 1);
					assert.deepStrictEqual(awsRumInstance.recordEvent.mock.calls[0].arguments, [
						'com.ft.mock.event',
						{}
					]);
				});
			});
		});

		describe('ft.clientMetric event handler', () => {
			let event;
			let eventHandler;

			beforeEach(() => {
				mock.method(instance, 'recordEvent');
				eventHandler = window.addEventListener.mock.calls[0].arguments[1];
				event = new CustomEvent('ft.clientMetric', {
					detail: {
						namespace: 'mock.event',
						mockProperty: 'mock-value'
					}
				});
				eventHandler(event);
			});

			it('calls recordEvent with the namespace and event data', () => {
				assert.strictEqual(instance.recordEvent.mock.callCount(), 1);
				assert.deepStrictEqual(instance.recordEvent.mock.calls[0].arguments, [
					'mock.event',
					{ mockProperty: 'mock-value' }
				]);
			});

			it('does not log any warnings', () => {
				assert.strictEqual(console.warn.mock.callCount(), 0);
			});

			describe('when event.detail.namespace is not a string', () => {
				beforeEach(() => {
					instance.recordEvent.mock.resetCalls();
					event.detail.namespace = 123;
					eventHandler(event);
				});

				it('does not call recordEvent', () => {
					assert.strictEqual(instance.recordEvent.mock.callCount(), 0);
				});

				it('logs a warning about the namespace type', () => {
					assert.strictEqual(console.warn.mock.callCount(), 1);
					assert.deepStrictEqual(console.warn.mock.calls[0].arguments, [
						'Invalid metrics event: detail.namespace (number) must be a string'
					]);
				});
			});

			describe('when event.detail is not an object', () => {
				beforeEach(() => {
					instance.recordEvent.mock.resetCalls();
					event = new CustomEvent('ft.clientMetric', { detail: 'nope' });
					eventHandler(event);
				});

				it('does not call recordEvent', () => {
					assert.strictEqual(instance.recordEvent.mock.callCount(), 0);
				});

				it('logs a warning about the detail type', () => {
					assert.strictEqual(console.warn.mock.callCount(), 1);
					assert.deepStrictEqual(console.warn.mock.calls[0].arguments, [
						'Invalid metrics event: detail must be an object'
					]);
				});
			});

			describe('when event is not a CustomEvent instance', () => {
				beforeEach(() => {
					instance.recordEvent.mock.resetCalls();
					eventHandler({});
				});

				it('does nothing', () => {
					// The condition that gets us here is mostly there to satisfy TypeScript
					// so we don't care about anyhing getting logged - I don't think it's
					// a case that can actually happen
					assert.strictEqual(instance.recordEvent.mock.callCount(), 0);
					assert.strictEqual(console.warn.mock.callCount(), 0);
				});
			});
		});

		describe('when options.allowedHostnamePattern does not match the window location', () => {
			beforeEach(() => {
				AwsRum.mock.resetCalls();
				window.location.hostname = 'mock-non-matching-hostname';
				instance = new MetricsClient(options);
			});

			it('does not create an AWS RUM client', () => {
				assert.strictEqual(AwsRum.mock.callCount(), 0);
			});

			it('logs a warning about hostname support', () => {
				assert.strictEqual(console.warn.mock.callCount(), 1);
				assert.deepStrictEqual(console.warn.mock.calls[0].arguments, [
					'Client not initialised: client errors cannot be handled on mock-non-matching-hostname'
				]);
			});
		});

		describe('when options.allowedHostnamePattern is not set', () => {
			beforeEach(() => {
				AwsRum.mock.resetCalls();
				delete options.allowedHostnamePattern;
				window.location.hostname = 'example.ft.com';
				instance = new MetricsClient(options);
			});

			it('defaults to matching *.ft.com', () => {
				assert.strictEqual(AwsRum.mock.callCount(), 1);
			});

			it('does not log any warnings', () => {
				assert.strictEqual(console.warn.mock.callCount(), 0);
			});
		});

		describe('when options.allowedHostnamePattern is not a regular expression', () => {
			beforeEach(() => {
				AwsRum.mock.resetCalls();
				options.allowedHostnamePattern = 'mock-pattern';
				instance = new MetricsClient(options);
			});

			it('does not create an AWS RUM client', () => {
				assert.strictEqual(AwsRum.mock.callCount(), 0);
			});

			it('logs a warning about the invalid type', () => {
				assert.strictEqual(console.warn.mock.callCount(), 1);
				assert.deepStrictEqual(console.warn.mock.calls[0].arguments, [
					'Client not initialised: option allowedHostnamePattern must be a RegExp'
				]);
			});
		});

		describe('when options.awsAppMonitorId is not a string', () => {
			beforeEach(() => {
				AwsRum.mock.resetCalls();
				options.awsAppMonitorId = 123;
				instance = new MetricsClient(options);
			});

			it('does not create an AWS RUM client', () => {
				assert.strictEqual(AwsRum.mock.callCount(), 0);
			});

			it('logs a warning about the invalid type', () => {
				assert.strictEqual(console.warn.mock.callCount(), 1);
				assert.deepStrictEqual(console.warn.mock.calls[0].arguments, [
					'Client not initialised: option awsAppMonitorId must be a string'
				]);
			});
		});

		describe('when options.awsAppMonitorRegion is not a string', () => {
			beforeEach(() => {
				AwsRum.mock.resetCalls();
				options.awsAppMonitorRegion = 123;
				instance = new MetricsClient(options);
			});

			it('does not create an AWS RUM client', () => {
				assert.strictEqual(AwsRum.mock.callCount(), 0);
			});

			it('logs a warning about the invalid type', () => {
				assert.strictEqual(console.warn.mock.callCount(), 1);
				assert.deepStrictEqual(console.warn.mock.calls[0].arguments, [
					'Client not initialised: option awsAppMonitorRegion must be a string'
				]);
			});
		});

		describe('when options.awsIdentityPoolId is not a string', () => {
			beforeEach(() => {
				AwsRum.mock.resetCalls();
				options.awsIdentityPoolId = 123;
				instance = new MetricsClient(options);
			});

			it('does not create an AWS RUM client', () => {
				assert.strictEqual(AwsRum.mock.callCount(), 0);
			});

			it('logs a warning about the invalid type', () => {
				assert.strictEqual(console.warn.mock.callCount(), 1);
				assert.deepStrictEqual(console.warn.mock.calls[0].arguments, [
					'Client not initialised: option awsIdentityPoolId must be a string'
				]);
			});
		});

		describe('when options.samplePercentage is not set', () => {
			beforeEach(() => {
				AwsRum.mock.resetCalls();
				delete options.samplePercentage;
				instance = new MetricsClient(options);
			});

			it('creates an AWS RUM client with a default sample rate of 5%', () => {
				assert.strictEqual(AwsRum.mock.callCount(), 1);
				assert.partialDeepStrictEqual(AwsRum.mock.calls[0].arguments, [
					'mock-app-monitor-id',
					'mock-version',
					'mock-app-monitor-region',
					{ sessionSampleRate: 0.05 }
				]);
			});

			it('does not log any warnings', () => {
				assert.strictEqual(console.warn.mock.callCount(), 0);
			});
		});

		describe('when options.systemCode is not a string', () => {
			beforeEach(() => {
				AwsRum.mock.resetCalls();
				options.systemCode = 123;
				instance = new MetricsClient(options);
			});

			it('does not create an AWS RUM client', () => {
				assert.strictEqual(AwsRum.mock.callCount(), 0);
			});

			it('logs a warning about the invalid type', () => {
				assert.strictEqual(console.warn.mock.callCount(), 1);
				assert.deepStrictEqual(console.warn.mock.calls[0].arguments, [
					'Client not initialised: option systemCode must be a string'
				]);
			});
		});

		describe('when options.systemVersion is not set', () => {
			beforeEach(() => {
				AwsRum.mock.resetCalls();
				delete options.systemVersion;
				instance = new MetricsClient(options);
			});

			it('creates an AWS RUM client with a default version of 0.0.0', () => {
				assert.strictEqual(AwsRum.mock.callCount(), 1);
				assert.partialDeepStrictEqual(AwsRum.mock.calls[0].arguments, [
					'mock-app-monitor-id',
					'0.0.0',
					'mock-app-monitor-region',
					{}
				]);
			});

			it('does not log any warnings', () => {
				assert.strictEqual(console.warn.mock.callCount(), 0);
			});
		});
	});
});
