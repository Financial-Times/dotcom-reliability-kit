/* eslint-disable no-console */
const { AwsRum } = require('aws-rum-web');

/**
 * @import { AwsRumConfig } from 'aws-rum-web'
 * @import { MetricsClientOptions, MetricsClient as MetricsClientType, MetricsEvent } from '@dotcom-reliability-kit/client-metrics-web'
 */

const namespacePattern = /^([a-z0-9_-]+)(\.[a-z0-9_-]+)+$/i;

exports.MetricsClient = class MetricsClient {
	/** @type {null | AwsRum} */
	#rum = null;

	/** @type {boolean} */
	#isAvailable = false;

	/** @type {boolean} */
	#isEnabled = false;

	/**
	 * @param {MetricsClientOptions} options
	 */
	constructor(options) {
		try {
			const {
				awsAppMonitorId,
				awsAppMonitorRegion,
				awsIdentityPoolId,
				samplePercentage,
				systemCode,
				systemVersion
			} = MetricsClient.#defaultOptions(options);

			// Convert percentage-based sample rate to a decimal
			const sessionSampleRate =
				Math.round(Math.min(Math.max(samplePercentage, 0), 100)) / 100;

			/** @type {AwsRumConfig} */
			const awsRumConfig = {
				allowCookies: false,
				disableAutoPageView: true,
				enableXRay: false,
				endpoint: `https://dataplane.rum.${awsAppMonitorRegion}.amazonaws.com`,
				identityPoolId: awsIdentityPoolId,
				sessionAttributes: { systemCode },
				sessionSampleRate,
				telemetries: ['errors']
			};

			this.#rum = new AwsRum(
				awsAppMonitorId,
				systemVersion,
				awsAppMonitorRegion,
				awsRumConfig
			);
			this.#isAvailable = true;
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
		if (this.#isAvailable && !this.#isEnabled) {
			this.#rum?.enable();
			window.addEventListener('ft.clientMetric', this.#handleMetricsEvent);
			this.#isEnabled = true;
		}
	}

	/** @type {MetricsClientType['disable']} */
	disable() {
		if (this.#isAvailable && this.#isEnabled) {
			this.#rum?.disable();
			window.removeEventListener('ft.clientMetric', this.#handleMetricsEvent);
			this.#isEnabled = false;
		}
	}

	/** @type {MetricsClientType['recordError']} */
	recordError(error) {
		this.#rum?.recordError(error);
	}

	/** @type {MetricsClientType['recordEvent']} */
	recordEvent(namespace, eventData = {}) {
		try {
			namespace = MetricsClient.#resolveNamespace(namespace);
			this.#rum?.recordEvent(namespace, eventData);
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
		const defaultedOptions = Object.assign(
			{
				allowedHostnamePattern: /\.ft\.com$/,
				samplePercentage: 5,
				systemVersion: '0.0.0'
			},
			options
		);
		this.#assertValidOptions(defaultedOptions);
		return defaultedOptions;
	}

	/**
	 * @param {Required<MetricsClientOptions>} options
	 * @returns {void}
	 */
	static #assertValidOptions({
		allowedHostnamePattern,
		awsAppMonitorId,
		awsAppMonitorRegion,
		awsIdentityPoolId,
		systemCode
	}) {
		if (!(allowedHostnamePattern instanceof RegExp)) {
			throw new TypeError('option allowedHostnamePattern must be a RegExp');
		}
		if (typeof awsAppMonitorId !== 'string') {
			throw new TypeError('option awsAppMonitorId must be a string');
		}
		if (typeof awsAppMonitorRegion !== 'string') {
			throw new TypeError('option awsAppMonitorRegion must be a string');
		}
		if (typeof awsIdentityPoolId !== 'string') {
			throw new TypeError('option awsIdentityPoolId must be a string');
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
