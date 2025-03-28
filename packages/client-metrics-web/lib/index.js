const { AwsRum } = require('aws-rum-web');

/**
 * @import { AwsRumConfig } from 'aws-rum-web'
 * @import { MetricsClientOptions, MetricsClient as MetricsClientType, MetricsEvent } from '@dotcom-reliability-kit/client-metrics-web'
 */

const cpClientMetrics = {
	appMonitorDomain: /\.ft\.com$/,
	appMonitorEndpoint: 'https://dataplane.rum.eu-west-1.amazonaws.com',
	appMonitorId: '9d83365c-91d0-4d9b-ac46-d73a7d1b574f',
	appMonitorRegion: 'eu-west-1',
	identityPoolId: 'eu-west-1:51b0ae4e-c11d-4047-b281-7357c61002c5'
};

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
				awsAppMonitorEndpoint,
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
				sessionSampleRate,
				identityPoolId: awsIdentityPoolId,
				endpoint: awsAppMonitorEndpoint,
				telemetries: ['errors'],
				allowCookies: false,
				enableXRay: false,
				disableAutoPageView: true,
				sessionAttributes: { systemCode }
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
			// eslint-disable-next-line no-console
			console.warn(`RUM client could not be initialised: ${error.message}`);
		}

		this.#handleMetricsEvent = this.#handleMetricsEvent.bind(this);
		this.enable();
	}

	/** @type {MetricsClientType['enable']} */
	enable() {
		if (this.#isAvailable && !this.#isEnabled) {
			this.#rum?.enable();
			window.addEventListener('ft.clientMetric', this.#handleMetricsEvent);
		}
	}

	/** @type {MetricsClientType['disable']} */
	disable() {
		if (this.#isAvailable && this.#isEnabled) {
			this.#rum?.disable();
			window.removeEventListener('ft.clientMetric', this.#handleMetricsEvent);
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
			// eslint-disable-next-line no-console
			console.warn(`Metrics event could not be sent: ${error.message}`);
		}
	};

	/** @type {MetricsClientType['recordError']} */
	recordError(error) {
		return this.#rum?.recordError(error);
	}

	/** @type {MetricsClientType['recordEvent']} */
	recordEvent(namespace, eventData = {}) {
		this.#rum?.recordEvent(
			MetricsClient.#resolveNamespace(namespace),
			eventData
		);
	}

	/**
	 * @param {MetricsClientOptions} options
	 * @returns {Required<MetricsClientOptions>}
	 */
	static #defaultOptions(options) {
		/** @type {Required<MetricsClientOptions>} */
		const defaultedOptions = Object.assign(
			{
				awsAppMonitorDomainPattern: cpClientMetrics.appMonitorDomain,
				awsAppMonitorEndpoint: cpClientMetrics.appMonitorEndpoint,
				awsAppMonitorId: cpClientMetrics.appMonitorId,
				awsAppMonitorRegion: cpClientMetrics.appMonitorRegion,
				awsIdentityPoolId: cpClientMetrics.identityPoolId,
				samplePercentage: 10,
				systemCode: null,
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
	static #assertValidOptions({ awsAppMonitorDomainPattern, systemCode }) {
		// No point trying to send RUM events when we're not running on an allowed domain
		const hostname = window.location.hostname;
		if (!awsAppMonitorDomainPattern.test(hostname)) {
			throw new Error(`Client errors cannot be handled on ${hostname}`);
		}

		if (typeof systemCode !== 'string') {
			throw new TypeError('Option systemCode must be a string');
		}
	}

	/**
	 * @param {string} namespace
	 * @returns {string}
	 */
	static #resolveNamespace(namespace) {
		return `com.ft.${namespace}`;
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
			throw new TypeError(`Event detail is not an object`);
		}
		if (typeof detail.namespace !== 'string') {
			throw new TypeError(`Event detail.namespace is not a string`);
		}
		return detail;
	}
};
