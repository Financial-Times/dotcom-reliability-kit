const {
	HttpError,
	OperationalError,
	UpstreamServiceError
} = require('@dotcom-reliability-kit/errors');

/**
 * @typedef {object} ErrorHandlerOptions
 * @property {string} [upstreamSystemCode]
 *     The system code of the upstream system that the `fetch` makes a request to.
 */

/**
 * @typedef {object} FetchResponse
 * @property {boolean} ok
 *     Whether the fetch was successful.
 * @property {number} status
 *     The response HTTP status code.
 * @property {string} url
 *     The URL of the response.
 */

/* eslint-disable jsdoc/valid-types */
// The ESLint JSDoc plugin we're using marks this as invalid despite it being fine.
// This is covered by the following GitHub issues. If these are closed then this should
// no longer be an issue:
// https://github.com/gajus/eslint-plugin-jsdoc/issues/145
// https://github.com/jsdoc-type-pratt-parser/jsdoc-type-pratt-parser/issues/96
// https://github.com/jsdoctypeparser/jsdoctypeparser/issues/50
/**
 * @typedef {<Response extends FetchResponse>(fetchPromise: Response | Promise<Response>) => Promise<Response>} FetchErrorHandler
 */
/* eslint-enable jsdoc/valid-types */

/**
 * Create a fetch error handler function.
 *
 * @param {ErrorHandlerOptions} [options]
 *     Configuration options for the handler.
 * @returns {FetchErrorHandler}
 *     Returns an error handler for use with a `fetch` function.
 */
function createFetchErrorHandler(options = {}) {
	const { upstreamSystemCode } = options;
	const relatesToSystems =
		typeof upstreamSystemCode === 'string' ? [upstreamSystemCode] : [];

	return async function handleFetchErrors(input) {
		let response = input;

		// If input is a promise, resolve it. We also handle
		// more errors this way.
		if (isPromise(input)) {
			try {
				response = await input;
			} catch (/** @type {any} */ error) {
				const errorCode = error?.code || error?.cause?.code;

				// Handle DNS errors
				if (errorCode === 'ENOTFOUND') {
					const hostname = error?.hostname || error?.cause?.hostname;
					const dnsLookupErrorMessage = `Cound not resolve DNS entry${
						hostname ? ` for host ${hostname}` : ''
					}`;
					throw new OperationalError({
						code: 'FETCH_DNS_LOOKUP_ERROR',
						message: dnsLookupErrorMessage,
						relatesToSystems,
						cause: error
					});
				}

				// Handle standardised abort and timeout errors
				const abortErrorMessage =
					'The fetch was aborted before the upstream service could respond';
				if (error?.name === 'AbortError' || error?.name === 'TimeoutError') {
					throw new OperationalError({
						code:
							error.name === 'AbortError'
								? 'FETCH_ABORT_ERROR'
								: 'FETCH_TIMEOUT_ERROR',
						message: abortErrorMessage,
						relatesToSystems,
						cause: error
					});
				}

				// Handle non-standardised timeout errors
				if (error?.name === 'FetchError' && error?.type === 'request-timeout') {
					throw new OperationalError({
						code: 'FETCH_TIMEOUT_ERROR',
						message: abortErrorMessage,
						relatesToSystems,
						cause: error
					});
				}

				// Handle socket hangups
				if (
					errorCode === 'ECONNRESET' ||
					error?.cause?.name === 'SocketError'
				) {
					throw new UpstreamServiceError({
						code: 'FETCH_SOCKET_HANGUP_ERROR',
						message: 'The connection to the upstream service was terminated',
						relatesToSystems,
						cause: error
					});
				}

				// We don't know what to do with this error so
				// we throw it as-is
				throw error;
			}
		}

		// Check whether the value we were given is a valid response object
		if (!isFetchResponse(response)) {
			// This is not an operational error because the invalid
			// input is highly likely to be a programmer error
			throw Object.assign(
				new TypeError(
					'Fetch handler must be called with a `fetch` response object or a `fetch` promise'
				),
				{ code: 'FETCH_ERROR_HANDLER_INVALID_INPUT' }
			);
		}

		// If the response isn't OK, we start throwing errors
		if (!response.ok) {
			// Parse the response URL so we can use the hostname in error messages
			let responseHostName = 'unknown';
			if (typeof response.url === 'string') {
				try {
					const url = new URL(response.url);
					responseHostName = url.hostname;
				} catch (_) {
					// We ignore this error because having a valid URL isn't essential – it
					// just helps debug if we do have one. If someone's using a weird non-standard
					// `fetch` implementation or mocking then this error could be fired
				}
			}

			// Some common error options which we'll include in any that are thrown
			const baseErrorOptions = {
				message: `The upstream service at "${responseHostName}" responded with a ${response.status} status`,
				relatesToSystems,
				upstreamUrl: response.url,
				upstreamStatusCode: response.status
			};

			// If the back end responds with a `4xx` error then it normally indicates
			// that something is wrong with the _current_ system. Maybe we're sending data
			// in an invalid format or our API key is invalid. For this we throw a generic
			// `500` error to indicate an issue with our system.
			if (response.status >= 400 && response.status < 500) {
				throw new HttpError(
					Object.assign(
						{ code: 'FETCH_CLIENT_ERROR', statusCode: 500 },
						baseErrorOptions
					)
				);
			}

			// If the back end responds with a `5xx` error then it normally indicates
			// that something is wrong with the _upstream_ system. For this we can output
			// an upstream service error and attribute the error to this system.
			if (response.status >= 500 && response.status < 600) {
				throw new UpstreamServiceError(
					Object.assign({ code: 'FETCH_SERVER_ERROR' }, baseErrorOptions)
				);
			}

			// If we get here then it's unclear what's wrong – `response.ok` is false but the status
			// isn't in the 400–599 range. We throw a generic 500 error so that we have visibility.
			throw new HttpError(
				Object.assign(
					{ code: 'FETCH_UNKNOWN_ERROR', statusCode: 500 },
					baseErrorOptions
				)
			);
		}

		return response;
	};
}

/**
 * @param {any} value
 *     The value to test.
 * @returns {value is Promise}
 *     Returns `true` if the value is a promise.
 */
function isPromise(value) {
	return value instanceof Promise || typeof value?.then === 'function';
}

/**
 * @param {any} value
 *     The value to test.
 * @returns {value is FetchResponse}
 *     Returns `true` if the value is a fetch response.
 */
function isFetchResponse(value) {
	if (!value || typeof value !== 'object') {
		return false;
	}
	if (typeof value.ok !== 'boolean') {
		return false;
	}
	if (typeof value.status !== 'number') {
		return false;
	}
	return true;
}

module.exports = createFetchErrorHandler;
