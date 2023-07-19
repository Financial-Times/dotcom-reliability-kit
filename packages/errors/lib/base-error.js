/**
 * @typedef {object} ErrorStrictData
 * @property {string} [code]
 *     A machine-readable error code which identifies the specific type of error.
 * @property {string} [message]
 *     A human readable message which describes the error.
 * @property {Error | null} [cause]
 *     The root cause error instance.
 */

/**
 * @typedef {ErrorStrictData & Record<string, any>} ErrorData
 */

/**
 * Class representing an error.
 */
class BaseError extends Error {
	/**
	 * @override
	 * @readonly
	 * @public
	 * @type {string}
	 */
	name = 'BaseError';

	/**
	 * Whether the error is operational.
	 *
	 * @readonly
	 * @public
	 * @type {boolean}
	 */
	isOperational = false;

	/**
	 * A machine-readable error code which identifies the specific type of error.
	 *
	 * @readonly
	 * @public
	 * @type {string}
	 */
	code = BaseError.defaultCode;

	/**
	 * The root cause error instance.
	 *
	 * @readonly
	 * @public
	 * @type {Error | null}
	 */
	cause = null;

	/**
	 * Additional error information.
	 *
	 * @readonly
	 * @public
	 * @type {{[key: string]: any}}
	 */
	data = {};

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
		super(data.message || BaseError.defaultMessage);

		if (typeof data.code === 'string') {
			this.code = BaseError.normalizeErrorCode(data.code);
		}

		if (data.cause instanceof Error) {
			this.cause = data.cause;
		}

		for (const [key, value] of Object.entries(data)) {
			// @ts-ignore TypeScript does not properly infer the constructor
			if (!this.constructor.reservedKeys.includes(key)) {
				this.data[key] = value;
			}
		}
	}

	/**
	 * Reserved keys that should not appear in `BaseError.prototype.data`.
	 *
	 * @protected
	 * @type {string[]}
	 */
	static reservedKeys = ['code', 'message', 'cause'];

	/**
	 * @protected
	 * @readonly
	 * @type {string}
	 */
	static defaultCode = 'UNKNOWN';

	/**
	 * @protected
	 * @readonly
	 * @type {string}
	 */
	static defaultMessage = 'An error occurred';

	/**
	 * Get whether an error object is marked as operational (it has a truthy `isOperational` property).
	 *
	 * @public
	 * @param {Error} error
	 *     The error object to check.
	 * @returns {boolean}
	 *     Returns whether the error is operational.
	 */
	static isErrorMarkedAsOperational(error) {
		// @ts-ignore Error.prototype.isOperational does not exist, but it's OK to check in this
		// case as we're manually casting `undefined` to a Boolean
		return Boolean(error.isOperational);
	}

	/**
	 * Normalize a machine-readable error code.
	 *
	 * @private
	 * @param {string} code
	 *     The error code to normalize.
	 * @returns {string}
	 *     Returns the normalized error code.
	 */
	static normalizeErrorCode(code) {
		return code
			.trim()
			.toUpperCase()
			.replace(/[^a-z0-9_]+/gi, '_');
	}
}

module.exports = BaseError;

module.exports.default = module.exports;
