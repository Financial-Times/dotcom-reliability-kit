import HttpError from './http-error.js';

/**
 * @import { UpstreamServiceError as UpstreamServiceErrorType } from '@dotcom-reliability-kit/errors'
 */

/**
 * Class representing an error in an upstream service.
 */
export default class UpstreamServiceError extends HttpError {
	/**
	 * @override
	 * @readonly
	 * @type {UpstreamServiceErrorType['name']}
	 */
	name = 'UpstreamServiceError';

	/**
	 * @override
	 * @protected
	 * @readonly
	 * @type {number}
	 */
	static defaultStatusCode = 502;
}
