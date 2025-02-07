const { UserInputError } = require('@dotcom-reliability-kit/errors');

/**
 * @typedef {object} RequestMethodOptions
 * @property {string[]} [allowedMethods] The HTTP methods that are allowed i.e. will not throw 405 errors.
 * @property {string} [message] The error message text to use if a disallowed method is used.
 * @property {import('@dotcom-reliability-kit/log-error').Logger} [logger] The logger to use for logging errors.
 */

/**
 * @typedef {import('express').Response} ExpressResponse
 */

/**
 * Create a middleware function to return 405 (rather than 404) for disallowed request methods.
 *
 * @param {RequestMethodOptions} [options]
 * @returns {import('express').RequestHandler} - Returns an Express middleware function.
 */
function allowRequestMethods(
	options = { allowedMethods: [], message: 'Method Not Allowed' }
) {
	// Check if allowed methods have been specified and are valid
	const allowedMethodsSpecified = options?.allowedMethods;
	if (
		!allowedMethodsSpecified ||
		allowedMethodsSpecified.length === 0 ||
		allowedMethodsSpecified.every((method) => typeof method !== 'string')
	) {
		throw new TypeError(
			'The `allowedMethods` option must be an array of strings'
		);
	}

	const normalisedAllowedRequestMethods = normaliseAllowedRequestMethods(
		allowedMethodsSpecified
	);

	return function allowRequestMethodsMiddleware(request, response, next) {
		// If headers are already sent, pass the error to the default Express error handler
		if (!response.headersSent) {
			response.header('Allow', normalisedAllowedRequestMethods.join(', '));
		}

		// If the incoming request method is not in the allowed methods array, then send a 405 error
		if (
			!normalisedAllowedRequestMethods.includes(request.method.toUpperCase())
		) {
			return next(new UserInputError({ statusCode: 405 }));
		} else {
			// Else if it is, then pass the request to the next() middleware
			next();
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
	return methods.map((method) => method.toUpperCase());
}

exports.allowRequestMethods = allowRequestMethods;
