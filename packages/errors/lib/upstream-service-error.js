const HttpError = require('./http-error');

/**
 * Class representing an error in an upstream service.
 */
class UpstreamServiceError extends HttpError {
	/**
	 * @override
	 * @readonly
	 * @public
	 * @type {string}
	 */
	name = 'UpstreamServiceError';

	/**
	 * Create an upstream service error.
	 *
	 * @param {string | number | HttpError.HttpErrorData} [message]
	 *     The error message if it's a string, the HTTP status code if it's a number, or full error
	 *     information if an object.
	 * @param {HttpError.HttpErrorData} [data]
	 *     Additional error information if `message` is a string or number.
	 */
	constructor(message, data = {}) {
		if (typeof message === 'string') {
			data.message = message;
		} else if (typeof message === 'number') {
			data.statusCode = message;
		} else {
			data = message || data;
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

module.exports.default = module.exports;
