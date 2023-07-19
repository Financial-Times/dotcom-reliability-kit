const BaseError = require('./base-error');

/**
 * @typedef {object} OperationalErrorStrictData
 * @property {string[]} [relatesToSystems]
 *     An array of FT system codes which are related to this error.
 */

/**
 * @typedef {OperationalErrorStrictData & BaseError.ErrorData} OperationalErrorData
 */

/**
 * Class representing an operational error.
 */
class OperationalError extends BaseError {
	/**
	 * @override
	 * @readonly
	 * @public
	 * @type {string}
	 */
	name = 'OperationalError';

	/**
	 * Whether the error is operational.
	 *
	 * @override
	 * @readonly
	 * @public
	 * @type {boolean}
	 */
	isOperational = true;

	/**
	 * An array of valid FT system codes (found in Biz Ops) which this error is related to.
	 * If this error is caused by one or more dependencies, include their system code here.
	 *
	 * @readonly
	 * @public
	 * @type {string[]}
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
	 * @param {OperationalErrorData} data
	 *     Additional error information.
	 */
	/**
	 * Create an error with a message and optional error data.
	 *
	 * @overload
	 * @param {string} message
	 *     The error message.
	 * @param {OperationalErrorData} [data]
	 *     Additional error information.
	 */
	/**
	 * @param {string | OperationalErrorData} [message]
	 *     The error message if it's a string, or full error information if an object.
	 * @param {OperationalErrorData} [data]
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
