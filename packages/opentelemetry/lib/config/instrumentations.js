const {
	getNodeAutoInstrumentations
} = require('@opentelemetry/auto-instrumentations-node');
const {
	RuntimeNodeInstrumentation
} = require('@opentelemetry/instrumentation-runtime-node');
const { logRecoverableError } = require('@dotcom-reliability-kit/log-error');
const { UserInputError } = require('@dotcom-reliability-kit/errors');

/**
 * @import { NodeSDKConfiguration } from '@opentelemetry/sdk-node'
 * @import { IgnoreIncomingRequestFunction } from '@opentelemetry/instrumentation-http'
 */

// Request paths that we ignore when instrumenting HTTP requests
const IGNORED_REQUEST_PATHS = ['/__gtg', '/__health', '/favicon.ico'];

/**
 * Create an instrumentations array for configuring OpenTelemetry.
 *
 * @returns {NodeSDKConfiguration['instrumentations']}
 */
exports.createInstrumentationConfig = function createInstrumentationConfig() {
	return [
		getNodeAutoInstrumentations({
			'@opentelemetry/instrumentation-http': {
				startOutgoingSpanHook(request) {
					return {
						['net.host.name']: `set-by-instrumentation-http-start-outgoing-span-hook: ${request.path}`,
						['peer.service']: 'test-peer-service',
						['peer.name']: 'test-peer-name'
					};
				},
				startIncomingSpanHook() {
					return {
						['net.host.name']:
							'set-by-instrumentation-http-start-incoming-span-hook',
						['peer.service']: 'test-peer-service',
						['peer.name']: 'test-peer-name'
					};
				},
				ignoreIncomingRequestHook
			},
			'@opentelemetry/instrumentation-fs': {
				enabled: false
			},
			'@opentelemetry/instrumentation-pino': {
				enabled: false
			},
			'@opentelemetry/instrumentation-undici': {
				startSpanHook(request) {
					return {
						['server.address']: `set-by-instrumentation-undici-start-span-hook: ${request.path}`,
						['peer.service']: 'test-peer-service',
						['peer.name']: 'test-peer-name'
					};
				}
			}
		})
		// Commented out to avoid a lot of spam when testing
		// new RuntimeNodeInstrumentation()
	];
};

/**
 * NOTE: this is not a filter like you know it. The name gives us a clue:
 * if the hook returns `true` then the request WILL be ignored.
 *
 * @see https://github.com/open-telemetry/opentelemetry-js/blob/main/experimental/packages/opentelemetry-instrumentation-http/README.md#http-instrumentation-options
 * @type {IgnoreIncomingRequestFunction}
 */
function ignoreIncomingRequestHook(request) {
	if (request.url) {
		try {
			const url = new URL(request.url, `http://${request.headers.host}`);

			// Don't send traces for paths that we frequently poll
			if (IGNORED_REQUEST_PATHS.includes(url.pathname)) {
				return true;
			}
		} catch (/** @type {any} */ cause) {
			// If URL parsing errors then we log it and move on.
			// We don't ignore URLs that result in an error because
			// we're interested in the traces from bad requests.
			logRecoverableError({
				error: new UserInputError({
					message: 'Failed to parse the request URL for filtering',
					code: 'OTEL_REQUEST_FILTER_FAILURE',
					cause
				}),
				includeHeaders: ['host'],
				request
			});
		}
	}
	return false;
}
