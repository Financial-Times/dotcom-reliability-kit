const HttpError = require('./http-error');

/**
 * @import { UserInputError as UserInputErrorType } from '@dotcom-reliability-kit/errors'
 */

/**
 * Class representing an error caused by invalid user input.
 */
class UserInputError extends HttpError {
	/**
	 * @override
	 * @readonly
	 * @type {UserInputErrorType['name']}
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
