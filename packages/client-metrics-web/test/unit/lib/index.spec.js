// biome-ignore-all lint/suspicious/noConsole: required because we're in a browser environment
jest.mock('aws-rum-web');

const { AwsRum } = require('aws-rum-web');
const { MetricsClient } = require('../../..');

describe('@dotcom-reliability-kit/client-metrics-web', () => {
	beforeEach(() => {
		global.window = {
			addEventListener: jest.fn(),
			removeEventListener: jest.fn(),
			location: {
				hostname: 'mock-hostname'
			}
		};
		jest.replaceProperty(global, 'console', {
			log: console.log,
			warn: jest.fn()
		});
	});

	afterEach(() => {
		delete global.window;
		jest.resetAllMocks();
		jest.restoreAllMocks();
	});

	it('exports a MetricsClient class', () => {
		expect(MetricsClient).toBeInstanceOf(Function);
		expect(() => {
			MetricsClient();
		}).toThrow(/class constructor/i);
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
			expect(AwsRum).toHaveBeenCalledTimes(1);
			expect(AwsRum).toHaveBeenCalledWith(
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
			);
		});

		it('enables the AWS RUM client', () => {
			expect(AwsRum.mock.instances[0].enable).toHaveBeenCalledTimes(1);
		});

		it('adds an "ft.clientMetric" event listener to the window', () => {
			expect(window.addEventListener).toHaveBeenCalledTimes(1);
			// Jest expect.any(Function) does not work with bound functions so we can't
			// use `toHaveBeenCalledWith`
			const args = window.addEventListener.mock.calls[0];
			expect(args[0]).toStrictEqual('ft.clientMetric');
			expect(typeof args[1]).toStrictEqual('function');
		});

		it('does not log any warnings', () => {
			expect(console.warn).toHaveBeenCalledTimes(0);
		});

		describe('.isAvailable', () => {
			it('is set to true', () => {
				expect(instance.isAvailable).toStrictEqual(true);
			});
		});

		describe('.isEnabled', () => {
			it('is set to true', () => {
				expect(instance.isEnabled).toStrictEqual(true);
			});
		});

		describe('.disable()', () => {
			beforeEach(() => {
				instance.disable();
			});

			it('disables the AWS RUM client', () => {
				expect(AwsRum.mock.instances[0].disable).toHaveBeenCalledTimes(1);
			});

			it('removes the "ft.clientMetric" event listener from the window', () => {
				expect(window.removeEventListener).toHaveBeenCalledTimes(1);
				// Jest expect.any(Function) does not work with bound functions so we can't
				// use `toHaveBeenCalledWith`
				const args = window.removeEventListener.mock.calls[0];
				expect(args[0]).toStrictEqual('ft.clientMetric');
				expect(typeof args[1]).toStrictEqual('function');
			});

			it('sets the isEnabled property to false', () => {
				expect(instance.isEnabled).toStrictEqual(false);
			});

			describe('when the client is already disabled', () => {
				beforeEach(() => {
					AwsRum.mock.instances[0].disable.mockClear();
					window.removeEventListener.mockClear();
					instance.disable();
				});

				it('does nothing', () => {
					expect(AwsRum.mock.instances[0].disable).toHaveBeenCalledTimes(0);
					expect(window.removeEventListener).toHaveBeenCalledTimes(0);
				});
			});
		});

		describe('.enable()', () => {
			beforeEach(() => {
				AwsRum.mock.instances[0].enable.mockClear();
				window.addEventListener.mockClear();
				instance.disable();
				instance.enable();
			});

			it('re-enables the AWS RUM client', () => {
				expect(AwsRum.mock.instances[0].enable).toHaveBeenCalledTimes(1);
			});

			it('re-adds the "ft.clientMetric" event listener to the window', () => {
				expect(window.addEventListener).toHaveBeenCalledTimes(1);
				// Jest expect.any(Function) does not work with bound functions so we can't
				// use `toHaveBeenCalledWith`
				const args = window.addEventListener.mock.calls[0];
				expect(args[0]).toStrictEqual('ft.clientMetric');
				expect(typeof args[1]).toStrictEqual('function');
			});

			it('sets the isEnabled property to true', () => {
				expect(instance.isEnabled).toStrictEqual(true);
			});

			describe('when the client is already enabled', () => {
				beforeEach(() => {
					AwsRum.mock.instances[0].enable.mockClear();
					window.addEventListener.mockClear();
					instance.enable();
				});

				it('does nothing', () => {
					expect(AwsRum.mock.instances[0].enable).toHaveBeenCalledTimes(0);
					expect(window.addEventListener).toHaveBeenCalledTimes(0);
				});
			});
		});

		describe('.recordError(error)', () => {
			let error;

			beforeEach(() => {
				error = new Error('mock error');
				instance.recordError(error);
			});

			it('hands the error to the AWS RUM client', () => {
				expect(AwsRum.mock.instances[0].recordError).toHaveBeenCalledTimes(1);
				expect(AwsRum.mock.instances[0].recordError).toHaveBeenCalledWith(
					error
				);
			});
		});

		describe('.recordEvent(namespace, data)', () => {
			let eventData;

			beforeEach(() => {
				eventData = { mockEventData: true };
				instance.recordEvent('mock.event', eventData);
			});

			it('hands the event to the AWS RUM client with the namespace prefixed', () => {
				expect(AwsRum.mock.instances[0].recordEvent).toHaveBeenCalledTimes(1);
				expect(AwsRum.mock.instances[0].recordEvent).toHaveBeenCalledWith(
					'com.ft.mock.event',
					eventData
				);
			});

			it('does not log any warnings', () => {
				expect(console.warn).toHaveBeenCalledTimes(0);
			});

			describe('when the namespace includes uppercase characters', () => {
				beforeEach(() => {
					AwsRum.mock.instances[0].recordEvent.mockClear();
					instance.recordEvent('Mock.UPPER.Event', eventData);
				});

				it('hands the event to the AWS RUM client with the namespace converted to lower case', () => {
					expect(AwsRum.mock.instances[0].recordEvent).toHaveBeenCalledTimes(1);
					expect(AwsRum.mock.instances[0].recordEvent).toHaveBeenCalledWith(
						'com.ft.mock.upper.event',
						eventData
					);
				});
			});

			describe('when the namespace is not a string', () => {
				beforeEach(() => {
					AwsRum.mock.instances[0].recordEvent.mockClear();
					instance.recordEvent(123, eventData);
				});

				it('does not hand the event to the AWS RUM client', () => {
					expect(AwsRum.mock.instances[0].recordEvent).toHaveBeenCalledTimes(0);
				});

				it('logs a warning about the namespace type', () => {
					expect(console.warn).toHaveBeenCalledTimes(1);
					expect(console.warn).toHaveBeenCalledWith(
						'Invalid metrics event: namespace (number) must be a string'
					);
				});
			});

			describe('when the namespace does not include a period', () => {
				beforeEach(() => {
					AwsRum.mock.instances[0].recordEvent.mockClear();
					instance.recordEvent('mock', eventData);
				});

				it('does not hand the event to the AWS RUM client', () => {
					expect(AwsRum.mock.instances[0].recordEvent).toHaveBeenCalledTimes(0);
				});

				it('logs a warning about top-level namespaces being reserved', () => {
					expect(console.warn).toHaveBeenCalledTimes(1);
					expect(console.warn).toHaveBeenCalledWith(
						'Invalid metrics event: namespace ("mock") must include a period, the top level is reserved'
					);
				});
			});

			describe('when the namespace includes invalid characters', () => {
				beforeEach(() => {
					AwsRum.mock.instances[0].recordEvent.mockClear();
					instance.recordEvent('mock . namespace', eventData);
				});

				it('does not hand the event to the AWS RUM client', () => {
					expect(AwsRum.mock.instances[0].recordEvent).toHaveBeenCalledTimes(0);
				});

				it('logs a warning about valid namespace characters', () => {
					expect(console.warn).toHaveBeenCalledTimes(1);
					expect(console.warn).toHaveBeenCalledWith(
						'Invalid metrics event: namespace ("mock . namespace") must be a combination of alphanumeric characters, underscores, and hyphens, separated by periods'
					);
				});
			});

			describe('when event data is not defined', () => {
				beforeEach(() => {
					AwsRum.mock.instances[0].recordEvent.mockClear();
					instance.recordEvent('mock.event');
				});

				it('hands the event to the AWS RUM client with an empty object as event data', () => {
					expect(AwsRum.mock.instances[0].recordEvent).toHaveBeenCalledTimes(1);
					expect(AwsRum.mock.instances[0].recordEvent).toHaveBeenCalledWith(
						'com.ft.mock.event',
						{}
					);
				});
			});
		});

		describe('ft.clientMetric event handler', () => {
			let event;
			let eventHandler;

			beforeEach(() => {
				jest.spyOn(instance, 'recordEvent');
				eventHandler = window.addEventListener.mock.calls[0][1];
				event = new CustomEvent('ft.clientMetric', {
					detail: {
						namespace: 'mock.event',
						mockProperty: 'mock-value'
					}
				});
				eventHandler(event);
			});

			it('calls recordEvent with the namespace and event data', () => {
				expect(instance.recordEvent).toHaveBeenCalledTimes(1);
				expect(instance.recordEvent).toHaveBeenCalledWith('mock.event', {
					mockProperty: 'mock-value'
				});
			});

			it('does not log any warnings', () => {
				expect(console.warn).toHaveBeenCalledTimes(0);
			});

			describe('when event.detail.namespace is not a string', () => {
				beforeEach(() => {
					instance.recordEvent.mockClear();
					event.detail.namespace = 123;
					eventHandler(event);
				});

				it('does not call recordEvent', () => {
					expect(instance.recordEvent).toHaveBeenCalledTimes(0);
				});

				it('logs a warning about the namespace type', () => {
					expect(console.warn).toHaveBeenCalledTimes(1);
					expect(console.warn).toHaveBeenCalledWith(
						'Invalid metrics event: detail.namespace (number) must be a string'
					);
				});
			});

			describe('when event.detail is not an object', () => {
				beforeEach(() => {
					instance.recordEvent.mockClear();
					event = new CustomEvent('ft.clientMetric', { detail: 'nope' });
					eventHandler(event);
				});

				it('does not call recordEvent', () => {
					expect(instance.recordEvent).toHaveBeenCalledTimes(0);
				});

				it('logs a warning about the detail type', () => {
					expect(console.warn).toHaveBeenCalledTimes(1);
					expect(console.warn).toHaveBeenCalledWith(
						'Invalid metrics event: detail must be an object'
					);
				});
			});

			describe('when event is not a CustomEvent instance', () => {
				beforeEach(() => {
					instance.recordEvent.mockClear();
					eventHandler({});
				});

				it('does nothing', () => {
					// The condition that gets us here is mostly there to satisfy TypeScript
					// so we don't care about anyhing getting logged - I don't think it's
					// a case that can actually happen
					expect(instance.recordEvent).toHaveBeenCalledTimes(0);
					expect(console.warn).toHaveBeenCalledTimes(0);
				});
			});
		});

		describe('when options.allowedHostnamePattern does not match the window location', () => {
			beforeEach(() => {
				AwsRum.mockClear();
				window.location.hostname = 'mock-non-matching-hostname';
				instance = new MetricsClient(options);
			});

			it('does not create an AWS RUM client', () => {
				expect(AwsRum).toHaveBeenCalledTimes(0);
			});

			it('logs a warning about hostname support', () => {
				expect(console.warn).toHaveBeenCalledTimes(1);
				expect(console.warn).toHaveBeenCalledWith(
					'Client not initialised: client errors cannot be handled on mock-non-matching-hostname'
				);
			});
		});

		describe('when options.allowedHostnamePattern is not set', () => {
			beforeEach(() => {
				AwsRum.mockClear();
				delete options.allowedHostnamePattern;
				window.location.hostname = 'example.ft.com';
				instance = new MetricsClient(options);
			});

			it('defaults to matching *.ft.com', () => {
				expect(AwsRum).toHaveBeenCalledTimes(1);
			});

			it('does not log any warnings', () => {
				expect(console.warn).toHaveBeenCalledTimes(0);
			});
		});

		describe('when options.allowedHostnamePattern is not a regular expression', () => {
			beforeEach(() => {
				AwsRum.mockClear();
				options.allowedHostnamePattern = 'mock-pattern';
				instance = new MetricsClient(options);
			});

			it('does not create an AWS RUM client', () => {
				expect(AwsRum).toHaveBeenCalledTimes(0);
			});

			it('logs a warning about the invalid type', () => {
				expect(console.warn).toHaveBeenCalledTimes(1);
				expect(console.warn).toHaveBeenCalledWith(
					'Client not initialised: option allowedHostnamePattern must be a RegExp'
				);
			});
		});

		describe('when options.awsAppMonitorId is not a string', () => {
			beforeEach(() => {
				AwsRum.mockClear();
				options.awsAppMonitorId = 123;
				instance = new MetricsClient(options);
			});

			it('does not create an AWS RUM client', () => {
				expect(AwsRum).toHaveBeenCalledTimes(0);
			});

			it('logs a warning about the invalid type', () => {
				expect(console.warn).toHaveBeenCalledTimes(1);
				expect(console.warn).toHaveBeenCalledWith(
					'Client not initialised: option awsAppMonitorId must be a string'
				);
			});
		});

		describe('when options.awsAppMonitorRegion is not a string', () => {
			beforeEach(() => {
				AwsRum.mockClear();
				options.awsAppMonitorRegion = 123;
				instance = new MetricsClient(options);
			});

			it('does not create an AWS RUM client', () => {
				expect(AwsRum).toHaveBeenCalledTimes(0);
			});

			it('logs a warning about the invalid type', () => {
				expect(console.warn).toHaveBeenCalledTimes(1);
				expect(console.warn).toHaveBeenCalledWith(
					'Client not initialised: option awsAppMonitorRegion must be a string'
				);
			});
		});

		describe('when options.awsIdentityPoolId is not a string', () => {
			beforeEach(() => {
				AwsRum.mockClear();
				options.awsIdentityPoolId = 123;
				instance = new MetricsClient(options);
			});

			it('does not create an AWS RUM client', () => {
				expect(AwsRum).toHaveBeenCalledTimes(0);
			});

			it('logs a warning about the invalid type', () => {
				expect(console.warn).toHaveBeenCalledTimes(1);
				expect(console.warn).toHaveBeenCalledWith(
					'Client not initialised: option awsIdentityPoolId must be a string'
				);
			});
		});

		describe('when options.samplePercentage is not set', () => {
			beforeEach(() => {
				AwsRum.mockClear();
				delete options.samplePercentage;
				instance = new MetricsClient(options);
			});

			it('creates an AWS RUM client with a default sample rate of 5%', () => {
				expect(AwsRum).toHaveBeenCalledTimes(1);
				expect(AwsRum).toHaveBeenCalledWith(
					'mock-app-monitor-id',
					'mock-version',
					'mock-app-monitor-region',
					expect.objectContaining({ sessionSampleRate: 0.05 })
				);
			});

			it('does not log any warnings', () => {
				expect(console.warn).toHaveBeenCalledTimes(0);
			});
		});

		describe('when options.systemCode is not a string', () => {
			beforeEach(() => {
				AwsRum.mockClear();
				options.systemCode = 123;
				instance = new MetricsClient(options);
			});

			it('does not create an AWS RUM client', () => {
				expect(AwsRum).toHaveBeenCalledTimes(0);
			});

			it('logs a warning about the invalid type', () => {
				expect(console.warn).toHaveBeenCalledTimes(1);
				expect(console.warn).toHaveBeenCalledWith(
					'Client not initialised: option systemCode must be a string'
				);
			});
		});

		describe('when options.systemVersion is not set', () => {
			beforeEach(() => {
				AwsRum.mockClear();
				delete options.systemVersion;
				instance = new MetricsClient(options);
			});

			it('creates an AWS RUM client with a default version of 0.0.0', () => {
				expect(AwsRum).toHaveBeenCalledTimes(1);
				expect(AwsRum).toHaveBeenCalledWith(
					'mock-app-monitor-id',
					'0.0.0',
					'mock-app-monitor-region',
					expect.any(Object)
				);
			});

			it('does not log any warnings', () => {
				expect(console.warn).toHaveBeenCalledTimes(0);
			});
		});
	});
});
