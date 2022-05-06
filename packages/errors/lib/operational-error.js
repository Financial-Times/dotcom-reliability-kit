/**
 * @module @dotcom-reliability-kit/errors/lib/operational-error
 */

/**
 * Class representing an operational error.
 */
class OperationalError extends Error {
	/**
	 * @readonly
	 * @access public
	 * @type {string}
	 */
	name = 'OperationalError';

	/**
	 * Whether the error is operational.
	 *
	 * @readonly
	 * @access public
	 * @type {boolean}
	 */
	isOperational = true;

	/**
	 * A machine-readable error code which identifies the specific type of error.
	 *
	 * @readonly
	 * @access public
	 * @type {String}
	 */
	code = 'UNKNOWN';

	/**
	 * Additional error information.
	 *
	 * @readonly
	 * @access public
	 * @type {Object<String, String>}
	 */
	data = {};

	/**
	 * Create an operational error.
	 *
	 * @param {(String|OperationalErrorData)} [data = {}]
	 *     The error message if it's a string, or full error information if an object.
	 */
	constructor(data = {}) {
		if (typeof data === 'string') {
			data = { message: data };
		}
		super(data.message || 'An operational error occurred');

		if (typeof data.code === 'string') {
			this.code = OperationalError.normalizeErrorCode(data.code);
		}

		for (const [key, value] of Object.entries(data)) {
			// @ts-ignore TypeScript does not properly infer the constructor
			if (!this.constructor.reservedKeys.includes(key)) {
				this.data[key] = value;
			}
		}
	}

	/**
	 * Reserved keys that should not appear in `OperationalError.prototype.data`.
	 *
	 * @access private
	 * @type {Array<String>}
	 */
	static reservedKeys = ['code', 'message'];

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
	 * @access private
	 * @param {String} code
	 *     The error code to normalize.
	 * @returns {String}
	 *     Returns the normalized error code.
	 */
	static normalizeErrorCode(code) {
		return code
			.trim()
			.toUpperCase()
			.replace(/[^a-z0-9_]+/gi, '_');
	}
}

/**
 * @typedef {Object} OperationalErrorData
 * @property {String} [code]
 *     A machine-readable error code which identifies the specific type of error.
 * @property {String} [message]
 *     A human readable message which describes the error.
 */

module.exports = OperationalError;
