const HttpError = require('./http-error');

/**
 * @import { UpstreamServiceError as UpstreamServiceErrorType } from '@dotcom-reliability-kit/errors'
 */

/**
 * Class representing an error in an upstream service.
 */
class UpstreamServiceError extends HttpError {
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

module.exports = UpstreamServiceError;

module.exports.default = module.exports;
