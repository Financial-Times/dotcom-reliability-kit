const { UserInputError } = require('@dotcom-reliability-kit/errors');

/**
 * @import { RequestMethodOptions } from '@dotcom-reliability-kit/middleware-allow-request-methods'
 */

/**
 * @import { RequestHandler } from 'express'
 */

/**
 * Create a middleware function to return 405 (rather than 404) for disallowed request methods.
 *
 * @param {RequestMethodOptions} options
 * @returns {RequestHandler} - Returns an Express middleware function.
 */
function allowRequestMethods(options = { allowedMethods: [] }) {
	// Check if allowed methods have been specified and are valid
	const allowedMethodsSpecified = options?.allowedMethods;
	if (
		!Array.isArray(allowedMethodsSpecified) ||
		allowedMethodsSpecified.length === 0 ||
		allowedMethodsSpecified.every((method) => typeof method !== 'string')
	) {
		throw new TypeError('The `allowedMethods` option must be an array of strings');
	}

	const normalisedAllowedRequestMethods = normaliseAllowedRequestMethods(allowedMethodsSpecified);

	return function allowRequestMethodsMiddleware(request, response, next) {
		// We can't set the Allow header if headers have already been sent, otherwise the middleware will error
		if (!response.headersSent) {
			response.header('Allow', normalisedAllowedRequestMethods.join(', '));
		}

		// If the incoming request method is not in the allowed methods array, then send a 405 error
		if (!normalisedAllowedRequestMethods.includes(request.method)) {
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
