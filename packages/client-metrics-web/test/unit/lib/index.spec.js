// biome-ignore-all lint/suspicious/noConsole: required because we're in a browser environment
jest.mock('../../../package.json', () => ({
	version: '0.0.0-test'
}));

const { MetricsClient } = require('../../..');

const DEFAULT_BATCH_SIZE = 20;
const QUEUE_CAPACITY = 10000;

const recordBatchOfEvents = ({
	instance,
	numberOfEvents = DEFAULT_BATCH_SIZE,
	namespace,
	data
}) => {
	const events = new Array(numberOfEvents).fill({ namespace, data });
	events.forEach((event) => {
		if (event.data) {
			instance.recordEvent(event.namespace, event.data);
		} else {
			instance.recordEvent(event.namespace);
		}
	});
};

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

	describe('Setup which MetricClient server to use based on environment variable or hostname', () => {
		describe("if the user pass a 'test' environment variable", () => {
			let instance;

			beforeEach(() => {
				const options = {
					systemCode: 'mock-system-code',
					systemVersion: 'mock-version',
					environment: 'test'
				};
				instance = new MetricsClient(options);
			});

			it('should set up the endpoint to the test server', () => {
				expect(instance.endpoint).toStrictEqual(
					'https://client-metrics-test.ft.com/api/v1/ingest'
				);
			});
		});

		describe("if the user pass a 'production' environment variable", () => {
			let instance;

			beforeEach(() => {
				const options = {
					systemCode: 'mock-system-code',
					systemVersion: 'mock-version',
					environment: 'production'
				};
				instance = new MetricsClient(options);
			});

			it('should set up the endpoint to the production server', () => {
				expect(instance.endpoint).toStrictEqual(
					'https://client-metrics.ft.com/api/v1/ingest'
				);
			});
		});

		describe('when no environment is passed, it uses the hostname to define the server to send metrics to', () => {
			const testEnvironmentHostnames = [
				'localhost:3000',
				'local.ft.com',
				'dotcom-pages-staging.ft.com',
				'homepage-staging.ft.com',
				'spark-test.ft.com',
				'falcon-test.ft.com'
			];
			const prodEnvironmentHostnames = ['www.ft.com', 'www.thebanker.com'];

			testEnvironmentHostnames.forEach((testEnvironmentHostname) => {
				describe(`for hostname ${testEnvironmentHostname}`, () => {
					let instance;

					beforeEach(() => {
						const options = {
							systemCode: 'mock-system-code',
							systemVersion: 'mock-version'
						};
						window.location.hostname = testEnvironmentHostname;
						instance = new MetricsClient(options);
					});

					it(`should set up the test server`, () => {
						expect(instance.endpoint).toStrictEqual(
							'https://client-metrics-test.ft.com/api/v1/ingest'
						);
					});
				});
			});

			prodEnvironmentHostnames.forEach((prodEnvironmentHostname) => {
				describe(`for ${prodEnvironmentHostname}`, () => {
					let instance;

					beforeEach(() => {
						const options = {
							systemCode: 'mock-system-code',
							systemVersion: 'mock-version'
						};
						window.location.hostname = prodEnvironmentHostname;
						instance = new MetricsClient(options);
					});

					it(`should set up the prod server for hostname ${prodEnvironmentHostname}`, () => {
						expect(instance.endpoint).toStrictEqual(
							'https://client-metrics.ft.com/api/v1/ingest'
						);
					});
				});
			});
		});
	});

	describe('new MetricsClient(options)', () => {
		let instance;
		let options;

		beforeEach(() => {
			options = {
				systemCode: 'mock-system-code',
				systemVersion: 'mock-version'
			};
			instance = new MetricsClient(options);
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

		it('sends a batch of events', () => {
			recordBatchOfEvents({
				instance,
				namespace: 'mock.event.create.client.metrics',
				data: { mockEventData: true }
			});

			expect(global.fetch).toHaveBeenCalledTimes(1);

			const requestBody = JSON.parse(global.fetch.mock.calls[0][1].body);

			expect(global.fetch.mock.calls[0][0]).toStrictEqual(
				'https://client-metrics.ft.com/api/v1/ingest'
			);
			expect(global.fetch.mock.calls[0][1]).toStrictEqual(
				expect.objectContaining({
					method: 'POST',
					headers: expect.objectContaining({
						'Content-Type': 'application/json',
						'User-Agent': 'FTSystem/cp-client-metrics/0.0.0-test'
					})
				})
			);
			expect(requestBody.length).toBe(DEFAULT_BATCH_SIZE);
			expect(requestBody[0]).toEqual({
				namespace: 'mock.event.create.client.metrics',
				systemCode: 'mock-system-code',
				systemVersion: 'mock-version',
				eventTimestamp: 658281600000,
				data: { mockEventData: true }
			});
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
				instance.clearQueue();
				mockData = { mockEventData: true };
				recordBatchOfEvents({
					instance,
					namespace: 'mock.event.record.event',
					data: mockData
				});
			});

			it('posts the event with the namespace', () => {
				expect(global.fetch).toHaveBeenCalledTimes(1);
				const body = JSON.parse(global.fetch.mock.calls[0][1].body);
				expect(body[0].namespace).toBe('mock.event.record.event');
				expect(body[0].data).toStrictEqual(mockData);
			});

			it('does not log any warnings', () => {
				expect(console.warn).toHaveBeenCalledTimes(0);
			});

			describe('when the namespace includes uppercase characters', () => {
				beforeEach(() => {
					global.fetch.mockClear();
					instance.recordEvent('Mock.UPPER.Event', mockData);
				});

				afterAll(() => {
					instance.clearQueue();
				});

				it('hands the event to the client with the namespace converted to lower case', () => {
					expect(instance.queue[0].namespace).toBe('mock.upper.event');
				});
			});

			describe('when the namespace is not a string', () => {
				beforeEach(() => {
					global.fetch.mockClear();
					instance.recordEvent(123, mockData);
				});

				afterAll(() => {
					instance.clearQueue();
				});

				it('does not record the event', () => {
					expect(instance.queue.length).toBe(0);
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

				afterAll(() => {
					instance.clearQueue();
				});

				it('does not post the event', () => {
					expect(instance.queue.length).toBe(0);
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
					instance.clearQueue();
					global.fetch.mockClear();
					recordBatchOfEvents({
						instance,
						namespace: 'mock.event.empty.data'
					});
				});

				it('hands the event to the client with an empty object as event data', () => {
					expect(global.fetch).toHaveBeenCalledTimes(1);
					const body = JSON.parse(global.fetch.mock.calls[0][1].body);
					expect(body[0].namespace).toStrictEqual('mock.event.empty.data');
					expect(body[0].data).toStrictEqual({});
				});
			});
		});

		describe('ft.clientMetric event handler', () => {
			let event;
			let eventHandler;

			beforeEach(() => {
				eventHandler = window.addEventListener.mock.calls[0][1];
				event = new CustomEvent('ft.clientMetric', {
					detail: {
						namespace: 'mock.event.check.event.handler',
						mockProperty: 'mock-value'
					}
				});
				eventHandler(event);
			});

			it('adds the event namespace and data to the queue of events to be sent', () => {
				expect(instance.queue.length).toBe(1);
				expect(instance.queue[0].namespace).toBe('mock.event.check.event.handler');
				expect(instance.queue[0].data).toStrictEqual({
					mockProperty: 'mock-value'
				});
			});

			it('does not log any warnings', () => {
				expect(console.warn).toHaveBeenCalledTimes(0);
			});

			describe('when event.detail.namespace is not a string', () => {
				beforeEach(() => {
					instance.clearQueue();
					event.detail.namespace = 123;
					eventHandler(event);
				});

				it('does not add the event to the queue of events to be sent', () => {
					expect(instance.queue.length).toBe(0);
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
					instance.clearQueue();
					event = new CustomEvent('ft.clientMetric', { detail: 'nope' });
					eventHandler(event);
				});

				it('does not add the event to the queue of events to be sent', () => {
					expect(instance.queue.length).toBe(0);
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
					instance.clearQueue();
					eventHandler({});
				});

				it('does nothing', () => {
					// The condition that gets us here is mostly there to satisfy TypeScript
					// so we don't care about anyhing getting logged - I don't think it's
					// a case that can actually happen
					expect(instance.queue.length).toBe(0);
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

			it('enables the client and uses the prod server', () => {
				expect(instance.isEnabled).toBe(true);
				expect(instance.endpoint).toBe('https://client-metrics.ft.com/api/v1/ingest');
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
				expect(instance.endpoint).toBe('https://client-metrics-test.ft.com/api/v1/ingest');
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
					'Client not initialised: systemCode must be be a combination of alphanumeric characters possibly separated by hyphens'
				);
			});

			it('logs a warning if trying to record an event', () => {
				instance.recordEvent('mock.event', { mockEventData: true });
				expect(console.warn).toHaveBeenCalledWith(
					'Client not initialised properly, cannot record an event'
				);
			});
		});

		describe('when options.systemCode includes invalid characters', () => {
			beforeEach(() => {
				global.fetch.mockClear();
				options.systemCode = '123.456';
				instance = new MetricsClient(options);
			});

			it('does not enabled the client', () => {
				expect(instance.isEnabled).toBe(false);
			});

			it('logs a warning about the invalid type', () => {
				expect(console.warn).toHaveBeenCalledTimes(1);
				expect(console.warn).toHaveBeenCalledWith(
					'Client not initialised: systemCode must be be a combination of alphanumeric characters possibly separated by hyphens'
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

				recordBatchOfEvents({
					instance,
					namespace: 'data.event.fetch.reject',
					data: { mockEventData: true }
				});
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

	describe('ClientMetrics batching logic', () => {
		let instance;
		let options;

		beforeEach(() => {
			options = {
				systemCode: 'mock-system-code',
				systemVersion: 'mock-version'
			};
			instance = new MetricsClient(options);
		});

		describe('batchSize', () => {
			const defaultBatchSize = 20;

			afterAll(() => {
				options.batchSize = undefined;
			});

			it('uses the default batchSize if none is passed when creating the client', () => {
				const instance = new MetricsClient(options);
				expect(instance.batchSize).toBe(defaultBatchSize);
			});

			it('uses the default batchSize if a user try to set it to a smaller number than the default', () => {
				options.batchSize = defaultBatchSize - 1;
				const instance = new MetricsClient(options);
				expect(instance.batchSize).toBe(defaultBatchSize);
			});

			it('uses the batchSize option if its bigger than the default', () => {
				options.batchSize = defaultBatchSize + 1;
				const instance = new MetricsClient(options);
				expect(instance.batchSize).toBe(defaultBatchSize + 1);
			});
		});

		describe('retentionPeriod', () => {
			const defaultRetentionPeriod = 10;

			afterAll(() => {
				options.retentionPeriod = undefined;
			});

			it('uses the default retentionPeriod if none is passed when creating the client', () => {
				const instance = new MetricsClient(options);
				expect(instance.retentionPeriod).toBe(defaultRetentionPeriod);
			});

			it('uses the default retentionPeriod if a user try to set it to a smaller number than the default', () => {
				options.retentionPeriod = defaultRetentionPeriod - 1;
				const instance = new MetricsClient(options);
				expect(instance.retentionPeriod).toBe(defaultRetentionPeriod);
			});

			it('uses the batchSize option if its bigger than the default', () => {
				options.retentionPeriod = defaultRetentionPeriod + 1;
				const instance = new MetricsClient(options);
				expect(instance.retentionPeriod).toBe(defaultRetentionPeriod + 1);
			});
		});

		describe('#sendEvents behaviour (batching, timer, capacity & guards)', () => {
			afterEach(() => {
				instance.clearQueue();
				instance.enable();
			});

			it('sends the events once the retentionPeriod is finished (even if the batch is not full)', () => {
				instance.recordEvent('mock.event.timer', { data: 'ok' });
				expect(global.fetch).toHaveBeenCalledTimes(0);

				// We check that we are sending event only after the elapsedTime
				jest.advanceTimersByTime(10000);
				expect(global.fetch).toHaveBeenCalledTimes(1);

				const body = JSON.parse(global.fetch.mock.calls[0][1].body);
				expect(body[0].namespace).toBe('mock.event.timer');
				expect(instance.queue.length).toBe(0);
			});

			it('does not call fetch when retentionPeriod is finished but the queue is empty', () => {
				jest.advanceTimersByTime(10000);
				expect(global.fetch).toHaveBeenCalledTimes(0);
			});

			it('does not call fetch when batchSize is reached but the client is disabled', () => {
				instance.disable();
				recordBatchOfEvents({
					instance,
					namespace: 'mock.event.disabled.client',
					data: { ok: true }
				});

				expect(global.fetch).toHaveBeenCalledTimes(0);
				expect(instance.queue.length).toBe(instance.batchSize);
			});

			it('recursively sends multiple batches until the queue is empty', () => {
				// We are disabling the client so we can grow the queue
				instance.disable();
				recordBatchOfEvents({
					instance,
					numberOfEvents: DEFAULT_BATCH_SIZE * 3,
					namespace: 'mock.event.recursive',
					data: { ok: true }
				});

				instance.enable();
				jest.advanceTimersByTime(10000);
				expect(global.fetch).toHaveBeenCalledTimes(3);
			});

			it('logs a warning and drop the oldest eventsif it hits the max capacity of the queue', () => {
				// We are disabling the client so we can grow the queue
				instance.disable();

				// First we record an old event with a recognizable namespace
				instance.recordEvent('mock.event.old.event', { ok: true });

				// Then we record the max number of events
				recordBatchOfEvents({
					instance,
					numberOfEvents: QUEUE_CAPACITY,
					namespace: 'mock.event.max.capacity',
					data: { ok: true }
				});

				// It should logs the warning
				expect(console.warn).toHaveBeenCalledTimes(1);
				expect(console.warn).toHaveBeenCalledWith(
					'There are too many events in the batch, we will drop the oldest event to clear the queue. If you see that warning too often, you might want to increase the size of your batch'
				);

				// The first event should not be found in the queue
				expect(
					instance.queue.filter((event) => event.namespace === 'mock.event.old.event')
						.length
				).toBe(0);

				// The more recents events that were in the queue should still be in
				expect(
					instance.queue.filter((event) => event.namespace === 'mock.event.max.capacity')
						.length
				).toBe(10000);
			});
		});
	});
});
