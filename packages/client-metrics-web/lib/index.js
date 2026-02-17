// biome-ignore-all lint/suspicious/noConsole: required because we're in a browser environment
const { version } = require('../package.json');
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

	/**
	 * @param {MetricsClientOptions} options
	 */
	constructor(options) {
		try {
			let { systemCode, systemVersion, environment } = options;

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
					environment === 'prod'
						? 'https://client-metrics.ft.com/'
						: 'https://client-metrics-test.ft.com/';
			} else {
				const hostname = window.location.hostname;
				baseUrl = testHostnamePattern.test(hostname)
					? 'https://client-metrics-test.ft.com/'
					: 'https://client-metrics.ft.com/';
			}

			this.endpoint = new URL('/api/v1/ingest', baseUrl).toString();

			this.systemCode = systemCode;
			this.systemVersion = systemVersion;

			this.#handleMetricsEvent = this.#handleMetricsEvent.bind(this);
			this.#isAvailable = true;
			this.enable();
		} catch (/** @type {any} */ error) {
			this.#isAvailable = false;
			console.warn(`Client not initialised: ${error.message}`);
			return;
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

	/** @type {MetricsClientType['enable']} */
	enable() {
		if (this.#isAvailable && !this.#isEnabled) {
			window.addEventListener('ft.clientMetric', this.#handleMetricsEvent);
			this.#isEnabled = true;
		}
	}

	/** @type {MetricsClientType['disable']} */
	disable() {
		if (this.#isAvailable && this.#isEnabled) {
			window.removeEventListener('ft.clientMetric', this.#handleMetricsEvent);
			this.#isEnabled = false;
		}
	}

	/** @type {MetricsClientType['recordEvent']} */
	recordEvent(namespace, eventData = {}) {
		if (!this.isAvailable || !this.endpoint) {
			console.warn('Client not initialised properly, cannot record an event');
			return;
		}
		try {
			namespace = MetricsClient.#resolveNamespace(namespace);

			const eventTimestamp = Date.now();
			const body = {
				namespace,
				systemCode: this.systemCode,
				systemVersion: this.systemVersion,
				eventTimestamp,
				data: eventData
			};

			fetch(this.endpoint, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'User-Agent': `FTSystem/cp-client-metrics/${version}`
				},
				body: JSON.stringify(body)
			}).catch((error) => {
				console.warn('Error happened during fetch: ', error);
			});
		} catch (/** @type {any} */ error) {
			console.warn(`Invalid metrics event: ${error.message}`);
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
