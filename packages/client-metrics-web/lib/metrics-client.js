// biome-ignore-all lint/suspicious/noConsole: required because we're in a browser environment
const { InMemoryQueue } = require('./queue/in-memory-queue');
const { Queue } = require('./queue/queue');

/**
 * @import { MetricsClientOptions, MetricsClient as MetricsClientType, MetricsEvent } from '@dotcom-reliability-kit/client-metrics-web'
 */

const namespacePattern = /^([a-z0-9_-]+)(\.[a-z0-9_-]+)*$/i;
const testHostnamePattern = /(local|test|staging)/i;
const systemCodePattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

exports.MetricsClient = class MetricsClient {
	/** @type {boolean} */
	#isAvailable = false;

	/** @type {boolean} */
	#isEnabled = false;

	/** @type {string} */
	#endpoint = '';

	/** @type {string} */
	#systemVersion = '0.0.0';

	/** @type {string} */
	#systemCode = '';

	/** @type {Queue}*/
	#queue;

	/** @type {number} */
	#batchSize = 20;

	/** @type {NodeJS.Timeout | undefined} */
	#timer;

	/** @type {number} */
	#elapsedSeconds = 0;

	/** @type {number} */
	#defaultRetentionPeriod = 10;

	/** @type {number} */
	#retentionPeriod = this.#defaultRetentionPeriod;

	/** @type {number} */
	#fetchAttempt = 0;

	/** @type {number} */
	#maxFetchAttempt = 10;

	/** @type {number} */
	#fetchFailed = 0;

	/** @type {number} */
	#maxFetchFailed = 3;

	/** @type {number} */
	#increasePercentage = 0.5;

	/** @type {number} */
	#maxRetentionPeriod = 120;

	/**
	 * @param {MetricsClientOptions} options
	 */
	constructor(options) {
		let { systemCode, systemVersion, environment, batchSize, retentionPeriod, queue } = options;

		if (queue) {
			if (!(queue instanceof Queue)) {
				throw new TypeError('The queue is not an instance of the base class Queue');
			}
			this.#queue = queue;
		} else {
			this.#queue = new InMemoryQueue();
		}

		try {
			if (typeof systemCode !== 'string' || !systemCodePattern.test(systemCode)) {
				throw new Error(
					'systemCode must be be a combination of alphanumeric characters possibly separated by hyphens'
				);
			}

			if (systemVersion === undefined || typeof systemVersion !== 'string') {
				systemVersion = '0.0.0';
			}

			let baseUrl;
			if (environment !== undefined) {
				baseUrl =
					environment === 'production'
						? 'https://client-metrics.ft.com/'
						: 'https://client-metrics-test.ft.com/';
			} else {
				const hostname = window.location.hostname;
				baseUrl = testHostnamePattern.test(hostname)
					? 'https://client-metrics-test.ft.com/'
					: 'https://client-metrics.ft.com/';
			}

			this.#endpoint = new URL('/api/v1/ingest', baseUrl).toString();

			this.#systemCode = systemCode;
			this.#systemVersion = systemVersion;

			if (batchSize && typeof batchSize === 'number') {
				this.#batchSize = Math.max(batchSize, this.#batchSize);
			}

			if (retentionPeriod && typeof retentionPeriod === 'number') {
				this.#retentionPeriod = Math.max(retentionPeriod, this.#retentionPeriod);
			}

			this.#handleMetricsEvent = this.#handleMetricsEvent.bind(this);
			this.#isAvailable = true;
			this.enable();
		} catch (/** @type {any} */ error) {
			this.#isAvailable = false;
			console.warn(`Client not initialised: ${error.message}`);
		}
	}

	/** @type {MetricsClientType['isAvailable']} */
	get isAvailable() {
		return this.#isAvailable;
	}

	/** @type {MetricsClientType['isEnabled']} */
	get isEnabled() {
		return this.#isEnabled;
	}

	/** @type {MetricsClientType['endpoint']} */
	get endpoint() {
		return this.#endpoint;
	}

	/** @type {MetricsClientType['batchSize']} */
	get batchSize() {
		return this.#batchSize;
	}

	/** @type {MetricsClientType['retentionPeriod']} */
	get retentionPeriod() {
		return this.#retentionPeriod;
	}

	/** @type {MetricsClientType['systemVersion']} */
	get systemVersion() {
		return this.#systemVersion;
	}

	/** @type {MetricsClientType['queue']} */
	get queue() {
		return this.#queue;
	}

	// As we are running fetches in parallel, we don't want to have
	// too many fetches running at the same time
	get #maxFetchInExecution() {
		return this.#fetchAttempt >= this.#maxFetchAttempt;
	}

	// If the fetch fails too many times, we consider that the client
	// might be offline and we reduce the amount of fetch we attempt
	get isOffline() {
		return this.#fetchFailed >= this.#maxFetchFailed;
	}

	/** @type {MetricsClientType['enable']} */
	enable() {
		if (this.#isAvailable && !this.#isEnabled) {
			window.addEventListener('ft.clientMetric', this.#handleMetricsEvent);
			this.#isEnabled = true;
			this.#startTimer();
		}
	}

	/** @type {MetricsClientType['disable']} */
	disable() {
		if (this.#isAvailable && this.#isEnabled) {
			window.removeEventListener('ft.clientMetric', this.#handleMetricsEvent);
			this.#isEnabled = false;
			this.#stopTimer();
		}
	}

	/** @type {MetricsClientType['recordEvent']} */
	recordEvent(namespace, data = {}) {
		if (!this.isAvailable || !this.#endpoint) {
			console.warn('Client not initialised properly, cannot record an event');
			return;
		}

		try {
			namespace = MetricsClient.#resolveNamespace(namespace);
			const timestamp = Date.now();

			const batchedEvent = {
				namespace,
				timestamp,
				data
			};

			this.#queue.add(batchedEvent);

			if (this.#queue.size >= this.#batchSize && !this.isOffline) {
				this.#sendEvents();
			}
		} catch (/** @type {any} */ error) {
			console.warn(`Invalid metrics event: ${error.message}`);
		}
	}

	#startTimer() {
		this.#timer = setInterval(() => {
			this.#elapsedSeconds += 1;
			if (this.#elapsedSeconds >= this.#retentionPeriod) {
				this.#sendEvents();
				this.#elapsedSeconds = 0;
			}
		}, 1000);
	}

	#stopTimer() {
		clearInterval(this.#timer);
		this.#timer = undefined;
	}

	#resetTimer() {
		this.#elapsedSeconds = 0;
	}

	#increaseRetentionPeriod() {
		const newRetentionPeriod =
			this.#retentionPeriod + this.#increasePercentage * this.#retentionPeriod;
		if (newRetentionPeriod <= this.#maxRetentionPeriod) {
			this.#retentionPeriod = newRetentionPeriod;
		} else {
			this.#retentionPeriod = this.#maxRetentionPeriod;
		}
	}

	#resetRetentionPeriod() {
		this.#retentionPeriod = this.#defaultRetentionPeriod;
	}

	#sendEvents() {
		if (!this.#queue.size || !this.#isEnabled || this.#maxFetchInExecution) {
			return;
		}

		// This check allows us not to start too many fetches at the same time
		this.#fetchAttempt++;

		this.#resetTimer();

		// We get the first (or all) events in the queue
		const numberOfEvents =
			this.#queue.size >= this.#batchSize ? this.#batchSize : this.#queue.size;

		const queuedEvents = this.#queue.pull(numberOfEvents);

		const events = queuedEvents.map((batchedEvent) => {
			return {
				namespace: batchedEvent.namespace,
				systemCode: this.#systemCode,
				systemVersion: this.#systemVersion,
				eventTimestamp: batchedEvent.timestamp,
				data: batchedEvent.data
			};
		});

		fetch(this.#endpoint, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			signal: AbortSignal.timeout(1000),
			body: JSON.stringify(events)
		})
			.then(() => {
				this.#fetchFailed = 0;

				// This check allows us not to start too many fetches at the same time
				this.#fetchAttempt--;

				// if we had previously detected to be offline, we might have increase the retention period
				// so if a fetch is succesful, we reset it to its normal amount just in case
				this.#resetRetentionPeriod();
			})
			.catch((error) => {
				console.warn('Error happened during fetch: ', error);

				// when a fetch has failed, we need to put the event we tried to send back in the queue
				// Note: this brings an issue with the dropping of the eldest event as the events are no longer guaranteed to be in order
				this.#queue.requeue(queuedEvents);

				// This check allows us not to start too many fetches at the same time
				this.#fetchAttempt--;

				// We count how many fetch fails to determine if the client might be offline
				this.#fetchFailed++;

				// whilst we are offline, we are reducing the frequency of attempts to fetch
				if (this.isOffline) {
					this.#increaseRetentionPeriod();
				}
			});

		if (this.#queue.size && !this.isOffline) {
			this.#sendEvents();
		}
	}

	/**
	 * @param {Event} event
	 */
	#handleMetricsEvent = (event) => {
		try {
			if (event instanceof CustomEvent) {
				const { namespace, ...data } = MetricsClient.#resolveEventDetail(event.detail);
				this.recordEvent(namespace, data);
			}
		} catch (/** @type {any} */ error) {
			console.warn(`Invalid metrics event: ${error.message}`);
		}
	};

	/**
	 * @param {string} namespace
	 * @returns {string}
	 */
	static #resolveNamespace(namespace) {
		if (typeof namespace !== 'string') {
			throw new TypeError(`namespace (${typeof namespace}) must be a string`);
		}
		if (!namespacePattern.test(namespace)) {
			throw new TypeError(
				`namespace ("${namespace}") must be a combination of alphanumeric characters, underscores, and hyphens, possibly separated by periods`
			);
		}
		return namespace.toLowerCase();
	}

	/**
	 * @param {any} detail
	 * @returns {MetricsEvent}
	 */
	static #resolveEventDetail(detail) {
		if (typeof detail !== 'object' || detail === null || Array.isArray(detail)) {
			throw new TypeError('detail must be an object');
		}
		if (typeof detail.namespace !== 'string') {
			throw new TypeError(`detail.namespace (${typeof detail.namespace}) must be a string`);
		}
		return detail;
	}
};
