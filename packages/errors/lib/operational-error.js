/**
 * @typedef {object} OperationalErrorData
 * @property {string} [code]
 *     A machine-readable error code which identifies the specific type of error.
 * @property {string} [message]
 *     A human readable message which describes the error.
 * @property {Array<string>} [relatesToSystems]
 *     An array of FT system codes which are related to this error.
 * @property {Error|null} [cause]
 *     The root cause error instance.
 */

/**
 * Class representing an operational error.
 */
class OperationalError extends Error {
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
	 * @readonly
	 * @public
	 * @type {boolean}
	 */
	isOperational = true;

	/**
	 * A machine-readable error code which identifies the specific type of error.
	 *
	 * @readonly
	 * @public
	 * @type {string}
	 */
	code = 'UNKNOWN';

	/**
	 * An array of valid FT system codes (found in Biz Ops) which this error is related to.
	 * If this error is caused by one or more dependencies, include their system code here.
	 *
	 * @readonly
	 * @public
	 * @type {Array<string>}
	 */
	relatesToSystems = [];

	/**
	 * The root cause error instance.
	 *
	 * @readonly
	 * @public
	 * @type {Error|null}
	 */
	cause = null;

	/**
	 * Additional error information.
	 *
	 * @readonly
	 * @public
	 * @type {Object<string, any>}
	 */
	data = {};

	/**
	 * Create an operational error.
	 *
	 * @param {(string | OperationalErrorData & Record<string, any>)} [data = {}]
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

		if (data.relatesToSystems) {
			if (Array.isArray(data.relatesToSystems)) {
				this.relatesToSystems = data.relatesToSystems;
			} else {
				this.relatesToSystems = [data.relatesToSystems];
			}
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
	 * Reserved keys that should not appear in `OperationalError.prototype.data`.
	 *
	 * @protected
	 * @type {Array<string>}
	 */
	static reservedKeys = ['code', 'message', 'relatesToSystems', 'cause'];

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

module.exports = OperationalError;

module.exports.default = module.exports;
