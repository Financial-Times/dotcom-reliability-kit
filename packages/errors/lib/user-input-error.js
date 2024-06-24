const HttpError = require('./http-error');

/**
 * Class representing an error caused by invalid user input.
 */
class UserInputError extends HttpError {
	/**
	 * @override
	 * @readonly
	 * @type {import('@dotcom-reliability-kit/errors').UserInputError['name']}
	 */
	name = 'UserInputError';

	/**
	 * @override
	 * @protected
	 * @readonly
	 * @type {number}
	 */
	static defaultStatusCode = 400;
}

module.exports = UserInputError;

module.exports.default = module.exports;
