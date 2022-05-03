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
};
