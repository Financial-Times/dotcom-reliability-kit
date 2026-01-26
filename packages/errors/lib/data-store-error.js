const OperationalError = require('./operational-error.js');

/**
 * @import { DataStoreError as DataStoreErrorType } from '@dotcom-reliability-kit/errors'
 */

/**
 * Class representing an error in an application's data store.
 */
class DataStoreError extends OperationalError {
	/**
	 * @override
	 * @readonly
	 * @type {DataStoreErrorType['name']}
	 */
	name = 'DataStoreError';
}

module.exports = DataStoreError;

module.exports.default = module.exports;
