/**
 * @module @dotcom-reliability-kit/errors/lib/operational-error
 */

/**
 * Class representing an operational error.
 */
module.exports = class OperationalError extends Error {
	/**
	 * @access public
	 * @type {String}
	 */
	name = 'OperationalError';

	/**
	 * @access public
	 * @type {Boolean}
	 */
	isOperational = true;

	/**
	 * Create an operational error.
	 *
	 * @access public
	 * @param {String} message
	 *     The error message.
	 */
	constructor(message) {
		// TODO process more error data here
		super(message);
	}

	/**
	 * Get whether an error object is marked as operational (it has a truthy `isOperational` property).
	 *
	 * @public
	 * @param {Error} error
	 *     The error object to check.
	 * @returns {Boolean}
	 *     Returns whether the error is operational.
	 */
	static isErrorMarkedAsOperational(error) {
		// @ts-ignore Error.prototype.isOperational does not exist, but it's OK to check in this
		// case as we're manually casting `undefined` to a Boolean
		return Boolean(error.isOperational);
	}
};
