const HttpError = require('./http-error');

/**
 * Class representing an error in an upstream service.
 */
class UpstreamServiceError extends HttpError {
	/**
	 * @override
	 * @readonly
	 * @public
	 * @type {string}
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
