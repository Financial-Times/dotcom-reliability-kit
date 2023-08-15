/**
 * @typedef {object} ErrorHandlerOptions
 * @property {string} upstreamSystemCode
 *     The system code of the upstream system that the `fetch` makes a request to.
 */

/**
 * @typedef {object} FetchResponse
 * @property {boolean} ok
 *     Whether the fetch was successful.
 * @property {number} status
 *     The response HTTP status code.
 */

/**
 * @callback FetchErrorHandler
 * @param {FetchResponse | Promise<FetchResponse>} fetchPromise
 * @returns {Promise<Response>}
 */

/**
 * Create an fetch error handler function.
 *
 * @param {ErrorHandlerOptions} [options]
 *     Configuration options for the handler.
 * @returns {FetchErrorHandler}
 *     Returns an error handler for use with a `fetch` function.
 */
exports.createFetchErrorHandler = function createFetchErrorHandler(options) {
	return async function handleFetchErrors(input) {
		let response = input;

		// If input is a promise, resolve it
		if (input instanceof Promise) {
			response = await input;
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

		return response;
	};
};

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

const handleFetchErrors = (exports.handleFetchErrors =
	exports.createFetchErrorHandler());

(async () => {
	const res1 = await handleFetchErrors({ ok: true, status: 404 });
	res1.headers;

	const res2 = await handleFetchErrors(new Response());
	res2.headers;

	Promise.resolve({ ok: true, status: 404 }).then(handleFetchErrors);
})();
