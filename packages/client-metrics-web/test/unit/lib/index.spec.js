// biome-ignore-all lint/suspicious/noConsole: required because we're in a browser environment
jest.mock('node:crypto');
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
		jest.useFakeTimers().setSystemTime(new Date('1990-11-11'));

		global.fetch = jest.fn(() => Promise.resolve({ status: 202, ok: true }));
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
		let randomUUID;

		beforeEach(() => {
			randomUUID = require('node:crypto').randomUUID;
			randomUUID.mockReturnValue('mock-generated-uuid');
			options = {
				systemCode: 'mock-system-code',
				systemVersion: 'mock-version'
			};
			instance = new MetricsClient(options);
		});

		it('creates an client with the given options', () => {
			instance.recordEvent('mock.event', { mockEventData: true });
			expect(global.fetch).toHaveBeenCalledTimes(1);
			expect(global.fetch).toHaveBeenCalledWith(
				'https://cp-client-metrics-server.eu-west-1.cp-internal-test.ftweb.tech/api/v1/ingest',
				expect.objectContaining({
					method: 'POST',
					headers: expect.objectContaining({
						'Content-Type': 'application/json',
						'User-Agent': 'FTSystem/cp-client-metrics/mock-version',
						'x-request-id': 'mock-generated-uuid'
					}),
					body: JSON.stringify({
						namespace: 'mock.event',
						systemCode: 'mock-system-code',
						systemVersion: 'mock-version',
						eventTimestamp: 658281600000,
						data: { mockEventData: true }
					})
				})
			);
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

		describe('.isEnabled', () => {
			it('is set to true', () => {
				expect(instance.isEnabled).toStrictEqual(true);
			});
		});

		describe('.disable()', () => {
			beforeEach(() => {
				instance.disable();
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
					window.removeEventListener.mockClear();
					instance.disable();
				});

				it('does nothing', () => {
					expect(window.removeEventListener).toHaveBeenCalledTimes(0);
				});
			});
		});

		describe('.enable()', () => {
			beforeEach(() => {
				window.addEventListener.mockClear();
				instance.disable();
				instance.enable();
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
					window.addEventListener.mockClear();
					instance.enable();
				});

				it('does nothing', () => {
					expect(window.addEventListener).toHaveBeenCalledTimes(0);
				});
			});
		});

		describe('.recordEvent(namespace, data)', () => {
			let mockData;

			beforeEach(() => {
				mockData = { mockEventData: true };
				instance.recordEvent('mock.event', mockData);
			});

			it('posts the event with the namespace', () => {
				expect(global.fetch).toHaveBeenCalledTimes(1);
				const body = JSON.parse(global.fetch.mock.calls[0][1].body);
				expect(body.namespace).toBe('mock.event');
				expect(body.data).toStrictEqual(mockData);
			});

			it('does not log any warnings', () => {
				expect(console.warn).toHaveBeenCalledTimes(0);
			});

			describe('when the namespace includes uppercase characters', () => {
				beforeEach(() => {
					global.fetch.mockClear();
					instance.recordEvent('Mock.UPPER.Event', mockData);
				});

				it('hands the event to the client with the namespace converted to lower case', () => {
					expect(global.fetch).toHaveBeenCalledTimes(1);
					const body = JSON.parse(global.fetch.mock.calls[0][1].body);
					expect(body.namespace).toBe('mock.upper.event');
				});
			});

			describe('when the namespace is not a string', () => {
				beforeEach(() => {
					global.fetch.mockClear();
					instance.recordEvent(123, mockData);
				});

				it('does not post the event', () => {
					expect(global.fetch).toHaveBeenCalledTimes(0);
				});

				it('logs a warning about the namespace type', () => {
					expect(console.warn).toHaveBeenCalledTimes(1);
					expect(console.warn).toHaveBeenCalledWith(
						'Invalid metrics event: namespace (number) must be a string'
					);
				});
			});

			describe('when the namespace includes invalid characters', () => {
				beforeEach(() => {
					global.fetch.mockClear();
					instance.recordEvent('mock . namespace', mockData);
				});

				it('does not post the event', () => {
					expect(global.fetch).toHaveBeenCalledTimes(0);
				});

				it('logs a warning about valid namespace characters', () => {
					expect(console.warn).toHaveBeenCalledTimes(1);
					expect(console.warn).toHaveBeenCalledWith(
						'Invalid metrics event: namespace ("mock . namespace") must be a combination of alphanumeric characters, underscores, and hyphens, possibly separated by periods'
					);
				});
			});

			describe('when event data is not defined', () => {
				beforeEach(() => {
					global.fetch.mockClear();
					instance.recordEvent('mock.event.empty.data');
				});

				it('hands the event to the client with an empty object as event data', () => {
					expect(global.fetch).toHaveBeenCalledTimes(1);
					const body = JSON.parse(global.fetch.mock.calls[0][1].body);
					expect(body.namespace).toStrictEqual('mock.event.empty.data');
					expect(body.data).toStrictEqual({});
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

		describe('when the window location is not part of allowedHostnamePattern', () => {
			beforeEach(() => {
				global.fetch.mockClear();
				window.location.hostname = 'mock-non-matching-hostname';
				instance = new MetricsClient(options);
			});

			it('enables the client and uses the test server', () => {
				expect(instance.isEnabled).toBe(true);
				expect(instance.endpoint).toBe(
					'https://cp-client-metrics-server.eu-west-1.cp-internal-test.ftweb.tech/api/v1/ingest'
				);
			});
		});

		describe('when the hostname is on ft.com', () => {
			beforeEach(() => {
				global.fetch.mockClear();
				window.location.hostname = 'example.ft.com';
				instance = new MetricsClient(options);
			});

			it('enables the client and uses the production server', () => {
				expect(instance.isEnabled).toBe(true);
				expect(instance.endpoint).toBe('https://client-metrics.ft.com/api/v1/ingest');
			});
		});

		describe("when the hostname is on ft.com but it's local", () => {
			beforeEach(() => {
				global.fetch.mockClear();
				window.location.hostname = 'local.ft.com';
				instance = new MetricsClient(options);
			});

			it('enables the client and uses the production server', () => {
				expect(instance.isEnabled).toBe(true);
				expect(instance.endpoint).toBe(
					'https://cp-client-metrics-server.eu-west-1.cp-internal-test.ftweb.tech/api/v1/ingest'
				);
			});
		});

		describe('when options.systemCode is not a string', () => {
			beforeEach(() => {
				global.fetch.mockClear();
				options.systemCode = 123;
				instance = new MetricsClient(options);
			});

			it('does not enabled the client', () => {
				expect(instance.isEnabled).toBe(false);
			});

			it('logs a warning about the invalid type', () => {
				expect(console.warn).toHaveBeenCalledTimes(1);
				expect(console.warn).toHaveBeenCalledWith(
					'Client not initialised: option systemCode must be a string'
				);
			});

			it('logs a warning if trying to record an event', () => {
				instance.recordEvent('mock.event', { mockEventData: true });
				expect(console.warn).toHaveBeenCalledWith(
					'Client not initialised properly, cannot record an event'
				);
			});
		});

		describe('when options.systemVersion is not set', () => {
			beforeEach(() => {
				global.fetch.mockClear();
				delete options.systemVersion;
				instance = new MetricsClient(options);
			});

			it('creates a client with a default version of 0.0.0', () => {
				expect(instance.systemVersion).toStrictEqual('0.0.0');
			});

			it('does not log any warnings', () => {
				expect(console.warn).toHaveBeenCalledTimes(0);
			});
		});

		describe('when fetch rejects', () => {
			beforeEach(async () => {
				global.fetch.mockClear();
				global.fetch = jest.fn(() => Promise.reject(new Error('Network down')));
				instance = new MetricsClient(options);
				instance.recordEvent('mock.event', { mockEventData: true });
			});

			it('logs a warning from the fetch catch handler', () => {
				expect(console.warn).toHaveBeenCalledWith(
					'Error happened during fetch: ',
					expect.any(Error)
				);
				expect(console.warn.mock.calls[0][1].message).toBe('Network down');
			});
		});
	});
});
