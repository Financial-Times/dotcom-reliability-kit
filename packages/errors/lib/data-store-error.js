const OperationalError = require('./operational-error');

/**
 * Class representing an error in an application's data store.
 */
class DataStoreError extends OperationalError {
	/**
	 * @override
	 * @readonly
	 * @public
	 * @type {string}
	 */
	name = 'DataStoreError';

	/**
	 * Create a data store error.
	 *
	 * @param {string | OperationalError.OperationalErrorData} [message]
	 *     The error message if it's a string, or full error information if an object.
	 * @param {OperationalError.OperationalErrorData} [data]
	 *     Additional error information if `message` is a string.
	 */
	constructor(message, data = {}) {
		super(message, data);
	}
}

module.exports = DataStoreError;

module.exports.default = module.exports;
