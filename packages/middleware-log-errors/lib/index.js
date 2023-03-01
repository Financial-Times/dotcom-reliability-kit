const {
	logHandledError,
	logRecoverableError
} = require('@dotcom-reliability-kit/log-error');

/**
 * @callback ErrorLoggingFilter
 * @param {any} error
 *     The error that will be logged.
 * @param {import('express').Request} request
 *     The Express request that resulted in the error.
 * @returns {boolean | void}
 *     Returns `true` if the error should be logged.
 */

/**
 * @typedef {object} ErrorLoggingOptions
 * @property {Array<string>} [includeHeaders]
 *     An array of request headers to include in the log.
 * @property {ErrorLoggingFilter} [filter]
 *     A filter function to determine whether an error should be logged.
 * @property {import('@dotcom-reliability-kit/log-error').Logger & Object<string, any>} [logger]
 *     The logger to use to output errors. Defaults to n-logger.
 */

/**
 * Create a middleware function to log errors.
 *
 * @public
 * @param {ErrorLoggingOptions} [options = {}]
 *     Options to configure the middleware.
 * @returns {import('express').ErrorRequestHandler}
 *     Returns error logging middleware.
 */
function createErrorLoggingMiddleware(options = {}) {
	// Validate the included headers (this stops the request serializer from erroring
	// on every request if the included headers are invalid)
	const includeHeaders = options?.includeHeaders;
	if (includeHeaders) {
		if (
			!Array.isArray(includeHeaders) ||
			!includeHeaders.every((header) => typeof header === 'string')
		) {
			throw new TypeError(
				'The `includeHeaders` option must be an array of strings'
			);
		}
	}

	// Validate the error filter.
	const filter = options?.filter;
	if (filter && typeof filter !== 'function') {
		throw new TypeError('The `filter` option must be a function');
	}

	return function errorLoggingMiddleware(error, request, response, next) {
		// We add a paranoid try/catch here because it'd be really embarassing
		// if the error logging middleware threw an unhandled error, wouldn't it
		try {
			// If we have a filter then check whether the error should be logged
			if (filter) {
				try {
					const shouldLog = filter(error, request);
					if (!shouldLog) {
						return next(error);
					}
				} catch (/** @type {any} */ filterError) {
					// If the filtering fails we just log the regular error as-is but
					// also log that the filtering failed
					logRecoverableError({
						// This is not an operational error because the filtering
						// error is highly likely to be a programmer error
						error: Object.assign(new Error('Log filtering failed'), {
							code: 'LOG_FILTER_FAILURE',
							cause: filterError
						}),
						includeHeaders,
						logger: options.logger,
						request
					});
				}
			}

			logHandledError({
				error,
				includeHeaders,
				logger: options.logger,
				request
			});

			// HACK: this suppresses the Raven error logger. We can remove this
			// code without a breaking change if/when we pull Raven logging into
			// this module and deprecate n-raven
			response.locals.suppressRavenLogger = true;
		} catch (_) {
			// Not a lot we can do here
		}
		next(error);
	};
}

module.exports = createErrorLoggingMiddleware;

module.exports.default = module.exports;
