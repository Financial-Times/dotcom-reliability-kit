const {
	logHandledError,
	logRecoverableError
} = require('@dotcom-reliability-kit/log-error');

/**
 * @import { ErrorLoggingOptions } from '@dotcom-reliability-kit/middleware-log-errors'
 * @import { ErrorRequestHandler as ExpressErrorHandler } from 'express'
 */

/**
 * Create a middleware function to log errors.
 *
 * @param {ErrorLoggingOptions} [options]
 * @returns {ExpressErrorHandler}
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
		} catch (_) {
			// Not a lot we can do here
		}
		next(error);
	};
}

module.exports = createErrorLoggingMiddleware;

module.exports.default = module.exports;
