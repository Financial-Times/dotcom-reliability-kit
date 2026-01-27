// biome-ignore-all lint/suspicious/noConsole: required because we're in a browser environment
const { after, afterEach, beforeEach, describe, it, mock } = require('node:test');
const assert = require('node:assert/strict');

mock.module('../../../package.json', {
	defaultExport: { version: '0.0.0-test' }
});

const { MetricsClient } = require('@dotcom-reliability-kit/client-metrics-web');
const { Queue } = require('../../../lib/queue/queue.js');

class MockQueue extends Queue {
	mockItems = [];

	add(item) {
		this.mockItems.push(item);
	}

	drop(count) {
		this.mockItems = this.mockItems.slice(0, count);
	}

	pull(count) {
		return this.mockItems.splice(0, count);
	}

	get size() {
		return this.mockItems.length;
	}
}

const DEFAULT_BATCH_SIZE = 20;

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
		mock.timers.enable({
			apis: ['Date', 'setInterval'],
			now: new Date('1990-11-11').getTime()
		});

		global.fetch = mock.fn(() => Promise.resolve({ status: 202, ok: true }));
	});

	afterEach(() => {
		delete global.window;
		mock.timers.reset();
		mock.restoreAll();
	});

	it('exports a MetricsClient class', () => {
		assert.ok(MetricsClient instanceof Function);
		assert.throws(() => MetricsClient(), /class constructor/i);
	});

	it('can create a client with a custom queue', () => {
		const customQueue = new MockQueue({ capacity: 11 });
		const instance = new MetricsClient({
			systemCode: 'test-queue',
			queue: customQueue
		});

		assert.strictEqual(instance.queue.capacity, 11);
	});

	it('will throw when trying to create a MetricsClient with a queue that does not extends the base Queue', () => {
		const wrongQueue = {};

		assert.throws(
			() => new MetricsClient({ queue: wrongQueue }),
			new TypeError('The queue is not an instance of the base class Queue')
		);
	});

	describe('Setup which MetricClient server to use based on environment variable or hostname', () => {
		describe("if the user pass a 'test' environment variable", () => {
			let instance;

			beforeEach(() => {
				const options = {
					systemCode: 'mock-system-code',
					systemVersion: 'mock-version',
					environment: 'test',
					queue: new MockQueue()
				};
				instance = new MetricsClient(options);
			});

			it('should set up the endpoint to the test server', () => {
				assert.strictEqual(
					instance.endpoint,
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
				assert.strictEqual(
					instance.endpoint,
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
						assert.strictEqual(
							instance.endpoint,
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
						assert.strictEqual(
							instance.endpoint,
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
				systemVersion: 'mock-version',
				queue: new MockQueue()
			};
			instance = new MetricsClient(options);
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

		it('sends a batch of events', () => {
			recordBatchOfEvents({
				instance,
				namespace: 'mock.event.create.client.metrics',
				data: { mockEventData: true }
			});

			assert.strictEqual(global.fetch.mock.callCount(), 1);

			const requestBody = JSON.parse(global.fetch.mock.calls[0].arguments[1].body);

			assert.strictEqual(
				global.fetch.mock.calls[0].arguments[0],
				'https://client-metrics.ft.com/api/v1/ingest'
			);
			assert.partialDeepStrictEqual(global.fetch.mock.calls[0].arguments[1], {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' }
			});
			assert.strictEqual(requestBody.length, DEFAULT_BATCH_SIZE);
			assert.deepStrictEqual(requestBody[0], {
				namespace: 'mock.event.create.client.metrics',
				systemCode: 'mock-system-code',
				systemVersion: 'mock-version',
				eventTimestamp: 658281600000,
				data: { mockEventData: true }
			});
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
			beforeEach(() => {
				instance.disable();
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
					window.removeEventListener.mock.resetCalls();
					instance.disable();
				});

				it('does nothing', () => {
					assert.strictEqual(window.removeEventListener.mock.callCount(), 0);
				});
			});
		});

		describe('.enable()', () => {
			beforeEach(() => {
				window.addEventListener.mock.resetCalls();
				instance.disable();
				instance.enable();
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
					window.addEventListener.mock.resetCalls();
					instance.enable();
				});

				it('does nothing', () => {
					assert.strictEqual(window.addEventListener.mock.callCount(), 0);
				});
			});
		});

		describe('.recordEvent(namespace, data)', () => {
			let mockData;

			beforeEach(() => {
				mockData = { mockEventData: true };
				recordBatchOfEvents({
					instance,
					namespace: 'mock.event.record.event',
					data: mockData
				});
			});

			it('posts the event with the namespace', () => {
				assert.strictEqual(global.fetch.mock.callCount(), 1);
				const body = JSON.parse(global.fetch.mock.calls[0].arguments[1].body);
				assert.strictEqual(body[0].namespace, 'mock.event.record.event');
				assert.deepStrictEqual(body[0].data, mockData);
			});

			it('does not log any warnings', () => {
				assert.strictEqual(console.warn.mock.callCount(), 0);
			});

			describe('when the namespace includes uppercase characters', () => {
				beforeEach(() => {
					global.fetch.mock.resetCalls();
					instance.recordEvent('Mock.UPPER.Event', mockData);
				});

				it('hands the event to the client with the namespace converted to lower case', () => {
					assert.strictEqual(instance.queue.mockItems[0].namespace, 'mock.upper.event');
				});
			});

			describe('when the namespace is not a string', () => {
				beforeEach(() => {
					global.fetch.mock.resetCalls();
					instance.recordEvent(123, mockData);
				});

				it('does not record the event', () => {
					assert.strictEqual(instance.queue.size, 0);
				});

				it('logs a warning about the namespace type', () => {
					assert.strictEqual(console.warn.mock.callCount(), 1);
					assert.deepStrictEqual(console.warn.mock.calls[0].arguments, [
						'Invalid metrics event: namespace (number) must be a string'
					]);
				});
			});

			describe('when the namespace includes invalid characters', () => {
				beforeEach(() => {
					global.fetch.mock.resetCalls();
					instance.recordEvent('mock . namespace', mockData);
				});

				it('does not post the event', () => {
					assert.strictEqual(instance.queue.size, 0);
				});

				it('logs a warning about valid namespace characters', () => {
					assert.strictEqual(console.warn.mock.callCount(), 1);
					assert.deepStrictEqual(console.warn.mock.calls[0].arguments, [
						'Invalid metrics event: namespace ("mock . namespace") must be a combination of alphanumeric characters, underscores, and hyphens, possibly separated by periods'
					]);
				});
			});

			describe('when event data is not defined', () => {
				beforeEach(() => {
					global.fetch.mock.resetCalls();
					recordBatchOfEvents({
						instance,
						namespace: 'mock.event.empty.data'
					});
				});

				it('hands the event to the client with an empty object as event data', () => {
					assert.strictEqual(global.fetch.mock.callCount(), 1);
					const body = JSON.parse(global.fetch.mock.calls[0].arguments[1].body);
					assert.strictEqual(body[0].namespace, 'mock.event.empty.data');
					assert.deepStrictEqual(body[0].data, {});
				});
			});
		});

		describe('ft.clientMetric event handler', () => {
			let event;
			let eventHandler;

			beforeEach(() => {
				eventHandler = window.addEventListener.mock.calls[0].arguments[1];
				event = new CustomEvent('ft.clientMetric', {
					detail: {
						namespace: 'mock.event.check.event.handler',
						mockProperty: 'mock-value'
					}
				});
				eventHandler(event);
			});

			it('adds the event namespace and data to the queue of events to be sent', () => {
				assert.strictEqual(instance.queue.size, 1);
				const firstEl = instance.queue.mockItems[0];
				assert.strictEqual(firstEl.namespace, 'mock.event.check.event.handler');
				assert.deepStrictEqual(firstEl.data, {
					mockProperty: 'mock-value'
				});
			});

			it('does not log any warnings', () => {
				assert.strictEqual(console.warn.mock.callCount(), 0);
			});

			describe('when event.detail.namespace is not a string', () => {
				beforeEach(() => {
					event.detail.namespace = 123;
					eventHandler(event);
				});

				it('does not add the event to the queue of events to be sent', () => {
					const queueItems = instance.queue.mockItems;
					assert.strictEqual(
						queueItems.filter((event) => event.namespace === 123).length,
						0
					);
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
					event = new CustomEvent('event.detail.not.object', {
						detail: 'nope'
					});
					eventHandler(event);
				});

				it('does not add the event to the queue of events to be sent', () => {
					const queueItems = instance.queue.mockItems;
					assert.strictEqual(
						queueItems.filter((event) => event.namespace === 'event.detail.not.object')
							.length,
						0
					);
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
					eventHandler({});
				});

				it('does nothing', () => {
					// The condition that gets us here is mostly there to satisfy TypeScript
					// so we don't care about anyhing getting logged - I don't think it's
					// a case that can actually happen
					assert.strictEqual(console.warn.mock.callCount(), 0);
				});
			});
		});

		describe('when the window location is not part of allowedHostnamePattern', () => {
			beforeEach(() => {
				global.fetch.mock.resetCalls();
				window.location.hostname = 'mock-non-matching-hostname';
				instance = new MetricsClient(options);
			});

			it('enables the client and uses the prod server', () => {
				assert.strictEqual(instance.isEnabled, true);
				assert.strictEqual(
					instance.endpoint,
					'https://client-metrics.ft.com/api/v1/ingest'
				);
			});
		});

		describe('when the hostname is on ft.com', () => {
			beforeEach(() => {
				global.fetch.mock.resetCalls();
				window.location.hostname = 'example.ft.com';
				instance = new MetricsClient(options);
			});

			it('enables the client and uses the production server', () => {
				assert.strictEqual(instance.isEnabled, true);
				assert.strictEqual(
					instance.endpoint,
					'https://client-metrics.ft.com/api/v1/ingest'
				);
			});
		});

		describe("when the hostname is on ft.com but it's local", () => {
			beforeEach(() => {
				global.fetch.mock.resetCalls();
				window.location.hostname = 'local.ft.com';
				instance = new MetricsClient(options);
			});

			it('enables the client and uses the production server', () => {
				assert.strictEqual(instance.isEnabled, true);
				assert.strictEqual(
					instance.endpoint,
					'https://client-metrics-test.ft.com/api/v1/ingest'
				);
			});
		});

		describe('when options.systemCode is not a string', () => {
			beforeEach(() => {
				global.fetch.mock.resetCalls();
				options.systemCode = 123;
				instance = new MetricsClient(options);
			});

			it('does not enabled the client', () => {
				assert.strictEqual(instance.isEnabled, false);
			});

			it('logs a warning about the invalid type', () => {
				assert.strictEqual(console.warn.mock.callCount(), 1);
				assert.deepStrictEqual(console.warn.mock.calls[0].arguments, [
					'Client not initialised: systemCode must be be a combination of alphanumeric characters possibly separated by hyphens'
				]);
			});

			it('logs a warning if trying to record an event', () => {
				console.warn.mock.resetCalls();
				instance.recordEvent('mock.event', { mockEventData: true });
				assert.deepStrictEqual(console.warn.mock.calls[0].arguments, [
					'Client not initialised properly, cannot record an event'
				]);
			});
		});

		describe('when options.systemCode includes invalid characters', () => {
			beforeEach(() => {
				global.fetch.mock.resetCalls();
				options.systemCode = '123.456';
				instance = new MetricsClient(options);
			});

			it('does not enabled the client', () => {
				assert.strictEqual(instance.isEnabled, false);
			});

			it('logs a warning about the invalid type', () => {
				assert.strictEqual(console.warn.mock.callCount(), 1);
				assert.deepStrictEqual(console.warn.mock.calls[0].arguments, [
					'Client not initialised: systemCode must be be a combination of alphanumeric characters possibly separated by hyphens'
				]);
			});

			it('logs a warning if trying to record an event', () => {
				console.warn.mock.resetCalls();
				instance.recordEvent('mock.event', { mockEventData: true });
				assert.deepStrictEqual(console.warn.mock.calls[0].arguments, [
					'Client not initialised properly, cannot record an event'
				]);
			});
		});

		describe('when options.systemVersion is not set', () => {
			beforeEach(() => {
				global.fetch.mock.resetCalls();
				delete options.systemVersion;
				instance = new MetricsClient(options);
			});

			it('creates a client with a default version of 0.0.0', () => {
				assert.strictEqual(instance.systemVersion, '0.0.0');
			});

			it('does not log any warnings', () => {
				assert.strictEqual(console.warn.mock.callCount(), 0);
			});
		});

		describe('when fetch rejects', () => {
			beforeEach(async () => {
				global.fetch.mock.resetCalls();
				global.fetch = mock.fn(() => Promise.reject(new Error('Network down')));
				instance = new MetricsClient(options);

				recordBatchOfEvents({
					instance,
					namespace: 'data.event.fetch.reject',
					data: { mockEventData: true }
				});
			});

			it('logs a warning from the fetch catch handler', () => {
				assert.deepStrictEqual(console.warn.mock.calls[0].arguments, [
					'Error happened during fetch: ',
					new Error('Network down')
				]);
			});
		});
	});

	describe('ClientMetrics batching logic', () => {
		let instance;
		let options;

		beforeEach(() => {
			options = {
				systemCode: 'mock-system-code',
				systemVersion: 'mock-version',
				queue: new MockQueue()
			};
			instance = new MetricsClient(options);
		});

		describe('batchSize', () => {
			const defaultBatchSize = 20;

			after(() => {
				options.batchSize = undefined;
			});

			it('uses the default batchSize if none is passed when creating the client', () => {
				const instance = new MetricsClient(options);
				assert.strictEqual(instance.batchSize, defaultBatchSize);
			});

			it('uses the default batchSize if a user try to set it to a smaller number than the default', () => {
				options.batchSize = defaultBatchSize - 1;
				const instance = new MetricsClient(options);
				assert.strictEqual(instance.batchSize, defaultBatchSize);
			});

			it('uses the batchSize option if its bigger than the default', () => {
				options.batchSize = defaultBatchSize + 1;
				const instance = new MetricsClient(options);
				assert.strictEqual(instance.batchSize, defaultBatchSize + 1);
			});
		});

		describe('retentionPeriod', () => {
			const defaultRetentionPeriod = 10;

			after(() => {
				options.retentionPeriod = undefined;
			});

			it('uses the default retentionPeriod if none is passed when creating the client', () => {
				const instance = new MetricsClient(options);
				assert.strictEqual(instance.retentionPeriod, defaultRetentionPeriod);
			});

			it('uses the default retentionPeriod if a user try to set it to a smaller number than the default', () => {
				options.retentionPeriod = defaultRetentionPeriod - 1;
				const instance = new MetricsClient(options);
				assert.strictEqual(instance.retentionPeriod, defaultRetentionPeriod);
			});

			it('uses the batchSize option if its bigger than the default', () => {
				options.retentionPeriod = defaultRetentionPeriod + 1;
				const instance = new MetricsClient(options);
				assert.strictEqual(instance.retentionPeriod, defaultRetentionPeriod + 1);
			});
		});

		describe('#sendEvents behaviour (batching, timer, capacity & guards)', () => {
			afterEach(() => {
				instance.enable();
			});

			it('sends the events once the retentionPeriod is finished (even if the batch is not full)', () => {
				instance.recordEvent('mock.event.timer', { data: 'ok' });
				assert.strictEqual(global.fetch.mock.callCount(), 0);

				// We check that we are sending event only after the elapsedTime
				mock.timers.tick(10000);
				assert.strictEqual(global.fetch.mock.callCount(), 1);

				const body = JSON.parse(global.fetch.mock.calls[0].arguments[1].body);
				assert.strictEqual(body[0].namespace, 'mock.event.timer');
				assert.strictEqual(instance.queue.size, 0);
			});

			it('does not call fetch when retentionPeriod is finished but the queue is empty', () => {
				mock.timers.tick(10000);
				assert.strictEqual(global.fetch.mock.callCount(), 0);
			});

			it('does not call fetch when batchSize is reached but the client is disabled', () => {
				instance.disable();
				recordBatchOfEvents({
					instance,
					namespace: 'mock.event.disabled.client',
					data: { ok: true }
				});

				assert.strictEqual(global.fetch.mock.callCount(), 0);
				assert.strictEqual(instance.queue.size, instance.batchSize);
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
				mock.timers.tick(10000);
				assert.strictEqual(global.fetch.mock.callCount(), 3);
			});
		});
	});
});
