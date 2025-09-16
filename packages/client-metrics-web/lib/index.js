/* eslint-disable no-console */

/**
 * @import { MetricsClientOptions, MetricsClient as MetricsClientType, MetricsEvent } from '@dotcom-reliability-kit/client-metrics-web'
 */

const bufferSize = 10;
const namespacePattern = /^([a-z0-9_-]+)(\.[a-z0-9_-]+)+$/i;

exports.MetricsClient = class MetricsClient {
	/** @type {MetricsEvent[]} */
	#buffer = [];

	/** @type {boolean} */
	#isAvailable = true;

	/** @type {boolean} */
	#isEnabled = false;

	/** @type {Required<MetricsClientOptions>} */
	#options;

	/**
	 * @param {MetricsClientOptions} options
	 */
	constructor(options) {
		try {
			this.#options = MetricsClient.#defaultOptions(options);
		} catch (/** @type {any} */ error) {
			this.#isAvailable = false;
			console.warn(`Client not initialised: ${error.message}`);
		}

		this.#handleMetricsEvent = this.#handleMetricsEvent.bind(this);
		this.enable();
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
		if (this.isAvailable && !this.#isEnabled) {
			window.addEventListener('ft.clientMetric', this.#handleMetricsEvent);
			this.#isEnabled = true;
		}
	}

	/** @type {MetricsClientType['disable']} */
	disable() {
		if (this.isAvailable && this.#isEnabled) {
			window.removeEventListener('ft.clientMetric', this.#handleMetricsEvent);
			this.#isEnabled = false;
		}
	}

	/** @type {MetricsClientType['recordEvent']} */
	recordEvent(namespace, eventData = {}) {
		try {
			namespace = MetricsClient.#resolveNamespace(namespace);
			this.#buffer.push({ namespace, timestamp: Date.now(), data: eventData });
			if (
				this.#isAvailable &&
				this.#isEnabled &&
				this.#buffer.length >= bufferSize
			) {
				this.flush();
			}
		} catch (/** @type {any} */ error) {
			console.warn(`Invalid metrics event: ${error.message}`);
		}
	}

	flush() {
		const events = this.#buffer;
		// TODO fetch
		this.#buffer = [];
	}

	/**
	 * @param {Event} event
	 */
	#handleMetricsEvent = (event) => {
		try {
			if (event instanceof CustomEvent) {
				const { namespace, ...data } = MetricsClient.#resolveEventDetail(
					event.detail
				);
				this.recordEvent(namespace, data);
			}
		} catch (/** @type {any} */ error) {
			console.warn(`Invalid metrics event: ${error.message}`);
		}
	};

	/**
	 * @param {MetricsClientOptions} options
	 * @returns {Required<MetricsClientOptions>}
	 */
	static #defaultOptions(options) {
		/** @type {Required<MetricsClientOptions>} */
		const defaultedOptions = Object.assign({ systemVersion: '0.0.0' }, options);
		this.#assertValidOptions(defaultedOptions);
		return defaultedOptions;
	}

	/**
	 * @param {Required<MetricsClientOptions>} options
	 * @returns {void}
	 */
	static #assertValidOptions({ systemCode, systemVersion }) {
		if (typeof systemCode !== 'string') {
			throw new TypeError('option systemCode must be a string');
		}
		if (typeof systemVersion !== 'string') {
			throw new TypeError('option systemVersion must be a string');
		}
	}

	/**
	 * @param {string} namespace
	 * @returns {string}
	 */
	static #resolveNamespace(namespace) {
		if (typeof namespace !== 'string') {
			throw new TypeError(`namespace (${typeof namespace}) must be a string`);
		}
		if (!namespace.includes('.')) {
			throw new TypeError(
				`namespace ("${namespace}") must include a period, the top level is reserved`
			);
		}
		if (!namespacePattern.test(namespace)) {
			throw new TypeError(
				`namespace ("${namespace}") must be a combination of alphanumeric characters, underscores, and hyphens, separated by periods`
			);
		}
		return `com.ft.${namespace.toLowerCase()}`;
	}

	/**
	 * @param {any} detail
	 * @returns {MetricsEvent}
	 */
	static #resolveEventDetail(detail) {
		if (
			typeof detail !== 'object' ||
			detail === null ||
			Array.isArray(detail)
		) {
			throw new TypeError('detail must be an object');
		}
		if (typeof detail.namespace !== 'string') {
			throw new TypeError(
				`detail.namespace (${typeof detail.namespace}) must be a string`
			);
		}
		return detail;
	}
};
