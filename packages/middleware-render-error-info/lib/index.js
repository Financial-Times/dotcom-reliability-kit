/**
 * @module @dotcom-reliability-kit/middleware-render-error-info
 */

const appInfo = require('@dotcom-reliability-kit/app-info');
const { logRecoverableError } = require('@dotcom-reliability-kit/log-error');
const renderErrorPage = require('./render-error-page');
const serializeError = require('@dotcom-reliability-kit/serialize-error');

/**
 * Create a middleware function to render an error info page.
 *
 * @access public
 * @returns {import('express').ErrorRequestHandler}
 *     Returns error info rendering middleware.
 */
function createErrorRenderingMiddleware() {
	// Only render the error info page if we're not in production.
	// Note: if we ever want to get this working in production, we
	// will need to make this middleware play nicely with
	// Sentry/n-raven – right now it will render a page and skip
	// any later middleware so Sentry will never run.
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
					request
				});
			}
		}
		next(error);
	};
}

module.exports = createErrorRenderingMiddleware;
