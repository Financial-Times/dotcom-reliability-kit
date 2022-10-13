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
	 * @param {(string | OperationalError.OperationalErrorData & Record<string, any>)} [data = {}]
	 *     The error message if it's a string, or full error information if an object.
	 */
	constructor(data = {}) {
		super(data);
	}
}

module.exports = DataStoreError;

module.exports.default = module.exports;
