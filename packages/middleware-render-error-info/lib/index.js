const appInfo = require('@dotcom-reliability-kit/app-info');
const { logRecoverableError } = require('@dotcom-reliability-kit/log-error');
const renderErrorPage = require('./render-error-page');
const serializeError = require('@dotcom-reliability-kit/serialize-error');

/**
 * @typedef {object} ErrorRenderingOptions
 * @property {import('@dotcom-reliability-kit/log-error').Logger & Object<string, any>} [logger]
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
		if (performRendering) {
			// It's unlikely that this will fail but we want to be sure
			// that any rendering errors are caught properly
			try {
				const serializedError = serializeError(error);
				response.status(serializedError.statusCode || 500);
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
			}
		}
		next(error);
	};
}

module.exports = createErrorRenderingMiddleware;

module.exports.default = module.exports;
