/**
 * @import { MetricsClientOptions, MetricsClient as MetricsClientType, MetricsEvent } from '@dotcom-reliability-kit/client-metrics-web'
 */

const namespacePattern = /^([a-z0-9_-]+)(\.[a-z0-9_-]+)*$/i;

exports.MetricsClient = class MetricsClient {

	/** @type {boolean} */
	#isEnabled = false;

	/**
	 * @param {MetricsClientOptions} options
	 */
	constructor(options) {
		try {
			const {
				systemCode,
				systemVersion
			} = MetricsClient.#defaultOptions(options);

			/** @type {TODO} */
			const awsRumConfig = {
				allowCookies: false,
				disableAutoPageView: true,
				enableXRay: false,
				endpoint: TODO,
				sessionAttributes: { systemCode },
				telemetries: ['errors']
			};

		} catch (/** @type {any} */ error) {
			console.warn(`Client not initialised: ${error.message}`);
		}

		this.#handleMetricsEvent = this.#handleMetricsEvent.bind(this);
		this.enable();
	}

	/** @type {MetricsClientType['isEnabled']} */
	get isEnabled() {
		return this.#isEnabled;
	}

	/** @type {MetricsClientType['enable']} */
	enable() {
		if (!this.#isEnabled) {
			window.addEventListener('ft.clientMetric', this.#handleMetricsEvent);
			this.#isEnabled = true;
		}
	}

	/** @type {MetricsClientType['disable']} */
	disable() {
		if (this.#isEnabled) {
			window.removeEventListener('ft.clientMetric', this.#handleMetricsEvent);
			this.#isEnabled = false;
		}
	}

	/** @type {MetricsClientType['recordEvent']} */
	recordEvent(namespace, eventData = {}) {
		try {
			namespace = MetricsClient.#resolveNamespace(namespace);
			// TODO: add the new way of recording events here
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
	 * @param {MetricsClientOptions} options
	 * @returns {Required<MetricsClientOptions>}
	 */
	static #defaultOptions(options) {
		/** @type {Required<MetricsClientOptions>} */
		const defaultedOptions = Object.assign(
			{
				allowedHostnamePattern: /\.ft\.com$/,
				systemVersion: '0.0.0'
			},
			options
		);
		MetricsClient.#assertValidOptions(defaultedOptions);
		return defaultedOptions;
	}

	/**
	 * @param {Required<MetricsClientOptions>} options
	 * @returns {void}
	 */
	static #assertValidOptions({
		allowedHostnamePattern,
		systemCode
	}) {
		if (!(allowedHostnamePattern instanceof RegExp)) {
			throw new TypeError('option allowedHostnamePattern must be a RegExp');
		}
		if (typeof systemCode !== 'string') {
			throw new TypeError('option systemCode must be a string');
		}

		// No point trying to send RUM events when we're not running on an allowed domain
		const hostname = window.location.hostname;
		if (!allowedHostnamePattern.test(hostname)) {
			throw new Error(`client errors cannot be handled on ${hostname}`);
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
		if (!namespacePattern.test(namespace)) {
			throw new TypeError(
				`namespace ("${namespace}") must be a combination of alphanumeric characters, underscores, and hyphens, possibly separated by periods`
			);
		}
		return `com.ft.${namespace.toLowerCase()}`;
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
