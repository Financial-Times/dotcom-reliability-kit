import OperationalError from './operational-error.js';

/**
 * @import { DataStoreError as DataStoreErrorType } from '@dotcom-reliability-kit/errors'
 */

/**
 * Class representing an error in an application's data store.
 */
export default class DataStoreError extends OperationalError {
	/**
	 * @override
	 * @readonly
	 * @type {DataStoreErrorType['name']}
	 */
	name = 'DataStoreError';
}
