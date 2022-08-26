/**
 * @module @dotcom-reliability-kit/errors/lib/upstream-service-error
 */

const HttpError = require('./http-error');

/**
 * Class representing an error in an upstream service.
 */
class UpstreamServiceError extends HttpError {
	/**
	 * @readonly
	 * @access public
	 * @type {string}
	 */
	name = 'UpstreamServiceError';

	/**
	 * Create an upstream service error.
	 *
	 * @param {(string | number | HttpError.HttpErrorData & import('./operational-error').OperationalErrorData & Record<string, any>)} [data = {}]
	 *     The error message if it's a string, the HTTP status code if it's a number, or full error
	 *     information if an object.
	 */
	constructor(data = {}) {
		if (typeof data === 'string') {
			data = { message: data };
		}
		if (typeof data === 'number') {
			data = { statusCode: data };
		}

		// Make sure that we don't modify the original data object
		// by shallow-cloning it
		data = { ...data };

		// Default the status code
		data.statusCode =
			typeof data.statusCode === 'number'
				? UpstreamServiceError.normalizeErrorStatusCode(data.statusCode)
				: 502;

		super(data);
	}
}

module.exports = UpstreamServiceError;