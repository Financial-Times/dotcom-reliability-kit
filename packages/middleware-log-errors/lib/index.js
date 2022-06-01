/**
 * @module @dotcom-reliability-kit/middleware-log-errors
 */

const logger = require('@financial-times/n-logger').default;
const serializeError = require('@dotcom-reliability-kit/serialize-error');
const serializeRequest = require('@dotcom-reliability-kit/serialize-request');

/**
 * @typedef {object} ErrorLoggingOptions
 * @property {Array<string>} [includeHeaders]
 *     An array of request headers to include in the log.
 */

/**
 * Create a middleware function to log errors.
 *
 * @access public
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

	return (error, request, response, next) => {
		// We add a paranoid try/catch here because it'd be really embarassing
		// if the error logging middleware threw an unhandled error, wouldn't it
		try {
			const systemCode = process.env.SYSTEM_CODE;
			const appNameHeader = response.getHeader('ft-app-name');
			const app = {
				name: systemCode || appNameHeader || null,
				region: process.env.REGION || null
			};

			logger.error({
				event: 'HANDLED_ERROR',
				error: serializeError(error),
				request: serializeRequest(request, { includeHeaders }),
				app
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
