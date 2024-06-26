/**
 * @typedef {import('@dotcom-reliability-kit/errors').BaseErrorData} ErrorData
 */

/**
 * Class representing an error.
 */
class BaseError extends Error {
	/**
	 * @override
	 * @readonly
	 * @type {import('@dotcom-reliability-kit/errors').BaseError['name']}
	 */
	name = 'BaseError';

	/**
	 * Whether the error is operational.
	 *
	 * @readonly
	 * @type {import('@dotcom-reliability-kit/errors').BaseError['isOperational']}
	 */
	isOperational = false;

	/**
	 * A machine-readable error code which identifies the specific type of error.
	 *
	 * @readonly
	 * @type {import('@dotcom-reliability-kit/errors').BaseError['code']}
	 */
	code = BaseError.defaultCode;

	/**
	 * The root cause error instance.
	 *
	 * @readonly
	 * @type {import('@dotcom-reliability-kit/errors').BaseError['cause']}
	 */
	cause = null;

	/**
	 * Additional error information.
	 *
	 * @readonly
	 * @type {import('@dotcom-reliability-kit/errors').BaseError['data']}
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
			const self = /** @type {typeof BaseError} */ (this.constructor);
			if (!self.reservedKeys.includes(key)) {
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
	 * @type {(typeof import('@dotcom-reliability-kit/errors').BaseError)['isErrorMarkedAsOperational']}
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
