// biome-ignore-all lint/suspicious/noConsole: required because we're in a browser environment
const { version } = require('../package.json');
/**
 * @import { MetricsClientOptions, MetricsClient as MetricsClientType, MetricsEvent, BatchedEvent } from '@dotcom-reliability-kit/client-metrics-web'
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

	/** @type {BatchedEvent[]}*/
	#queue = [];

	/** @type {number} */
	#batchSize = 20;

	/** @type {number} */
	#queueCapacity = 10000;

	/** @type {NodeJS.Timeout | undefined} */
	#timer;

	/** @type {number} */
	#elapsedSeconds = 0;

	/** @type {number} */
	#retentionPeriod = 10;

	/**
	 * @param {MetricsClientOptions} options
	 */
	constructor(options) {
		try {
			let { systemCode, systemVersion, environment, batchSize, retentionPeriod } = options;

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
		return Object.freeze(this.#queue);
	}

	/** @type {MetricsClientType['clearQueue']} */
	clearQueue() {
		this.#queue = [];
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

		if (this.#queue.length >= this.#queueCapacity) {
			console.warn(
				'There are too many events in the batch, we will drop the oldest event to clear the queue. If you see that warning too often, you might want to increase the size of your batch'
			);
			this.#queue.shift();
		}

		try {
			namespace = MetricsClient.#resolveNamespace(namespace);
			const timestamp = Date.now();

			const batchedEvent = {
				namespace,
				timestamp,
				data
			};

			this.#queue.push(batchedEvent);

			if (this.#queue.length >= this.#batchSize) {
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

	#sendEvents() {
		if (!this.#queue.length || !this.#isEnabled) {
			return;
		}

		this.#resetTimer();

		const events = this.#queue.splice(0, this.#batchSize).map((batchedEvent) => {
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
				'Content-Type': 'application/json',
				'User-Agent': `FTSystem/cp-client-metrics/${version}`
			},
			body: JSON.stringify(events)
		}).catch((error) => {
			console.warn('Error happened during fetch: ', error);
		});

		if (this.#queue.length) {
			this.#sendEvents();
		}
		// TODO: add the possibility to retry a batch that fails, with a limited amount of retries.
		// See offline work.
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
