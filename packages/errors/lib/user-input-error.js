const HttpError = require('./http-error');

/**
 * Class representing an error caused by invalid user input.
 */
class UserInputError extends HttpError {
	/**
	 * @readonly
	 * @access public
	 * @type {string}
	 */
	name = 'UserInputError';

	/**
	 * Create a user input error.
	 *
	 * @param {(string | HttpError.HttpErrorData & import('./operational-error').OperationalErrorData & Record<string, any>)} [data = {}]
	 *     The error message if it's a string or full error information if an object.
	 */
	constructor(data = {}) {
		if (typeof data === 'string') {
			data = { message: data };
		}

		// Make sure that we don't modify the original data object
		// by shallow-cloning it
		data = { ...data };

		// Default the status code
		data.statusCode =
			typeof data.statusCode === 'number'
				? UserInputError.normalizeErrorStatusCode(data.statusCode)
				: 400;

		super(data);
	}
}

module.exports = UserInputError;

module.exports.default = module.exports;
