const BaseError = require('./base-error');

/**
 * @import { OperationalError as OperationalErrorType, OperationalErrorData as ErrorData } from '@dotcom-reliability-kit/errors'
 */

/**
 * Class representing an operational error.
 */
class OperationalError extends BaseError {
	/**
	 * @override
	 * @readonly
	 * @type {OperationalErrorType['name']}
	 */
	name = 'OperationalError';

	/**
	 * Whether the error is operational.
	 *
	 * @override
	 * @readonly
	 * @type {OperationalErrorType['isOperational']}
	 */
	isOperational = true;

	/**
	 * An array of valid FT system codes (found in Biz Ops) which this error is related to.
	 * If this error is caused by one or more dependencies, include their system code here.
	 *
	 * @readonly
	 * @type {OperationalErrorType['relatesToSystems']}
	 */
	relatesToSystems = [];

	/**
	 * Create an error with no arguments.
	 *
	 * @overload
	 */
	/**
	 * Create an error with error data.
	 *
	 * @overload
	 * @param {ErrorData} data
	 *     Additional error information.
	 */
	/**
	 * Create an error with a message and optional error data.
	 *
	 * @overload
	 * @param {string} message
	 *     The error message.
	 * @param {ErrorData} [data]
	 *     Additional error information.
	 */
	/**
	 * @param {string | ErrorData} [message]
	 *     The error message if it's a string, or full error information if an object.
	 * @param {ErrorData} [data]
	 *     Additional error information if `message` is a string.
	 */
	constructor(message, data = {}) {
		if (typeof message === 'string') {
			data.message = message;
		} else {
			data = message || data;
		}
		super(data);

		if (this.message === BaseError.defaultMessage) {
			this.message = OperationalError.defaultMessage;
		}

		if (data.relatesToSystems) {
			if (Array.isArray(data.relatesToSystems)) {
				this.relatesToSystems = data.relatesToSystems;
			} else {
				this.relatesToSystems = [data.relatesToSystems];
			}
		}
	}

	/**
	 * Reserved keys that should not appear in `OperationalError.prototype.data`.
	 *
	 * @override
	 * @protected
	 * @type {string[]}
	 */
	static reservedKeys = [...BaseError.reservedKeys, 'relatesToSystems'];

	/**
	 * @override
	 * @protected
	 * @readonly
	 * @type {string}
	 */
	static defaultMessage = 'An operational error occurred';
}

module.exports = OperationalError;

module.exports.default = module.exports;
