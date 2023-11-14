const appInfo = require('@dotcom-reliability-kit/app-info');
const { logRecoverableError } = require('@dotcom-reliability-kit/log-error');
const renderErrorPage = require('./render-error-page');
const serializeError = require('@dotcom-reliability-kit/serialize-error');

/**
 * @typedef {object} ErrorRenderingOptions
 * @property {import('@dotcom-reliability-kit/log-error').Logger & {[key: string]: any}} [logger]
 *     The logger to use to output errors. Defaults to Reliability Kit logger.
 */

/**
 * Create a middleware function to render an error info page.
 *
 * @public
 * @param {ErrorRenderingOptions} [options]
 *     Options to configure the middleware.
 * @returns {import('express').ErrorRequestHandler}
 *     Returns error info rendering middleware.
 */
function createErrorRenderingMiddleware(options = {}) {
	// Only render the error info page if we're not in production.
	const performRendering = appInfo.environment === 'development';

	return function errorRenderingMiddleware(error, request, response, next) {
		// If headers have been sent already then we need to hand off to
		// the final Express error handler as documented here:
		// https://expressjs.com/en/guide/error-handling.html#the-default-error-handler
		//
		// This ensures that the app doesn't crash with `ERR_STREAM_WRITE_AFTER_END`
		if (response.headersSent) {
			return next(error);
		}

		// If we're not supposed to perform error rendering, then we hand off to the
		// default error handler.
		if (!performRendering) {
			return next(error);
		}

		// It's unlikely that this will fail but we want to be sure
		// that any rendering errors are caught properly
		try {
			// Serialize the error and extract the status code
			const serializedError = serializeError(error);
			const statusCode = serializedError.statusCode || 500;

			// If the error has a status code of less than `400` we
			// should default to `500` to ensure bad error handling
			// doesn't send false positive status codes. We also check
			// that the status code is a valid number.
			const isValidErrorStatus =
				!Number.isNaN(statusCode) && // Possible if `error.status` is something unexpected, like an object
				statusCode >= 400 &&
				statusCode <= 599;

			// Render an HTML error page
			response.status(isValidErrorStatus ? statusCode : 500);
			response.set('content-type', 'text/html');
			return response.send(
				renderErrorPage({
					request,
					response,
					serializedError
				})
			);
		} catch (/** @type {any} */ renderingError) {
			logRecoverableError({
				error: renderingError,
				logger: options.logger,
				request
			});
			next(error);
		}
	};
}

module.exports = createErrorRenderingMiddleware;

module.exports.default = module.exports;
