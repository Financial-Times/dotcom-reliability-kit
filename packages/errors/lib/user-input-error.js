import HttpError from './http-error.js';

/**
 * @import { UserInputError as UserInputErrorType } from '@dotcom-reliability-kit/errors'
 */

/**
 * Class representing an error caused by invalid user input.
 */
export default class UserInputError extends HttpError {
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
