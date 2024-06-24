const OperationalError = require('./operational-error');

/**
 * Class representing an error in an application's data store.
 */
class DataStoreError extends OperationalError {
	/**
	 * @override
	 * @readonly
	 * @type {import('@dotcom-reliability-kit/errors').DataStoreError['name']}
	 */
	name = 'DataStoreError';
}

module.exports = DataStoreError;

module.exports.default = module.exports;
