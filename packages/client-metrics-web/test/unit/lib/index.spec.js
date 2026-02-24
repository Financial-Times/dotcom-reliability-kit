// biome-ignore-all lint/suspicious/noConsole: required because we're in a browser environment
const { afterEach, beforeEach, describe, it, mock } = require('node:test');
const assert = require('node:assert/strict');

mock.module('../../../package.json', {
	defaultExport: { version: '0.0.0-test' }
});

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
		mock.timers.enable({ apis: ['Date'], now: new Date('1990-11-11').getTime() });

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
				systemVersion: 'mock-version'
			};
			instance = new MetricsClient(options);
		});

		it('creates a client with the given options', () => {
			instance.recordEvent('mock.event', { mockEventData: true });
			assert.strictEqual(global.fetch.mock.callCount(), 1);
			assert.partialDeepStrictEqual(global.fetch.mock.calls[0].arguments, [
				'https://client-metrics.ft.com/api/v1/ingest',
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						'User-Agent': 'FTSystem/cp-client-metrics/0.0.0-test'
					},
					body: JSON.stringify({
						namespace: 'mock.event',
						systemCode: 'mock-system-code',
						systemVersion: 'mock-version',
						eventTimestamp: 658281600000,
						data: { mockEventData: true }
					})
				}
			]);
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
				instance.recordEvent('mock.event', mockData);
			});

			it('posts the event with the namespace', () => {
				assert.strictEqual(global.fetch.mock.callCount(), 1);
				const body = JSON.parse(global.fetch.mock.calls[0].arguments[1].body);
				assert.strictEqual(body.namespace, 'mock.event');
				assert.deepStrictEqual(body.data, mockData);
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
					assert.strictEqual(global.fetch.mock.callCount(), 1);
					const body = JSON.parse(global.fetch.mock.calls[0].arguments[1].body);
					assert.strictEqual(body.namespace, 'mock.upper.event');
				});
			});

			describe('when the namespace is not a string', () => {
				beforeEach(() => {
					global.fetch.mock.resetCalls();
					instance.recordEvent(123, mockData);
				});

				it('does not post the event', () => {
					assert.strictEqual(global.fetch.mock.callCount(), 0);
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
					assert.strictEqual(global.fetch.mock.callCount(), 0);
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
					instance.recordEvent('mock.event.empty.data');
				});

				it('hands the event to the client with an empty object as event data', () => {
					assert.strictEqual(global.fetch.mock.callCount(), 1);
					const body = JSON.parse(global.fetch.mock.calls[0].arguments[1].body);
					assert.strictEqual(body.namespace, 'mock.event.empty.data');
					assert.deepStrictEqual(body.data, {});
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
				instance.recordEvent('mock.event', { mockEventData: true });
			});

			it('logs a warning from the fetch catch handler', () => {
				assert.deepStrictEqual(console.warn.mock.calls[0].arguments, [
					'Error happened during fetch: ',
					new Error('Network down')
				]);
			});
		});
	});
});
