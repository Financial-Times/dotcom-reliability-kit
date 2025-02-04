const { logRecoverableError } = require('@dotcom-reliability-kit/log-error');

/**
 * @typedef {object} RequestMethodOptions
 * @property {string[]} [allowedMethods] The HTTP methods that are allowed i.e. will not throw 405 errors.
 * @property {string} [message] The error message text to use if a disallowed method is used.
 * @property {import('@dotcom-reliability-kit/log-error').Logger} [logger] The logger to use for logging errors.
 */

/**
 * @typedef {import('express').ErrorRequestHandler} ExpressErrorHandler
 */

/**
 * Create a middleware function to return 405 (rather than 404) for disallowed request methods.
 *
 * @param {RequestMethodOptions} [options]
 * @returns {ExpressErrorHandler}
 */
function allowRequestMethods(
	options = { allowedMethods: [], message: 'Method Not Allowed' }
) {
	const normalisedAllowedRequestMethods = normaliseAllowedRequestMethods(
		options.allowedMethods || []
	);

	return function allowRequestMethodsMiddleware(
		error,
		request,
		response,
		next
	) {
		// If headers are already sent, pass the error to the default Express error handler
		if (response.headersSent) {
			return next(error);
		}

		try {
			// If the allowed methods array is empty, you can either allow all methods or reject everything
			if (normalisedAllowedRequestMethods.length === 0) {
				// TODO: Option 1: Allow all methods (no restriction) i.e. request proceeds as normal
				return next();

				// TODO: or Option 2: Reject all methods (405 for every request) i.e. block all requests when no methods are explicitly stated
				// response.header('Allow', normalisedAllowedRequestMethods.join(', '));
				// response.status(405).send(options.message);
				// return next(new MethodNotAllowedError(options.message));
			}

			// If the incoming request method is not in the allowed methods array, then send a 405 error
			if (
				!normalisedAllowedRequestMethods.includes(request.method.toUpperCase())
			) {
				response.header('Allow', normalisedAllowedRequestMethods.join(', '));
				response.status(405).send(options.message);
				return next(new MethodNotAllowedError(options.message));
			} else {
				// Else if it is, then pass the request to the next() middleware
				next();
			}
		} catch (/** @type {any} */ error) {
			if (options.logger) {
				logRecoverableError({
					error,
					logger: options.logger,
					request
				});
			}
			next(error);
		}
	};
}

/**
 * Normalise an array of HTTP methods.
 *
 * @param {string[]} methods - The HTTP methods to normalise.
 * @returns {string[]} - Returns an array of capitalised HTTP methods.
 */
function normaliseAllowedRequestMethods(methods) {
	if (!Array.isArray(methods) || methods.length === 0) {
		return [];
	}
	return methods
		.filter((method) => typeof method === 'string')
		.map((method) => method.toUpperCase());
}

/**
 * Error class for 405 Method Not Allowed errors.
 *
 * @augments Error
 * @property {string} name
 * @property {number} status
 * @property {number} statusCode
 */
class MethodNotAllowedError extends Error {
	/**
	 * @override
	 * @type {string}
	 */
	name = 'MethodNotAllowedError';

	/** @type {number} */
	status = 405;

	/** @type {number} */
	statusCode = 405;
}

module.exports = allowRequestMethods;
module.exports.default = module.exports;
