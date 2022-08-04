/**
 * @module @dotcom-reliability-kit/middleware-render-error-info
 */

const { logRecoverableError } = require('@dotcom-reliability-kit/log-error');
const serializeError = require('@dotcom-reliability-kit/serialize-error');

/**
 * Create a middleware function to render an error info page.
 *
 * @access public
 * @returns {import('express').ErrorRequestHandler}
 *     Returns error info rendering middleware.
 */
function createErrorRenderingMiddleware() {
	// Only render the error info page if we're not in production
	const performRendering =
		process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;

	return (error, request, response, next) => {
		if (performRendering) {
			// It's unlikely that this will fail but we want to be sure
			// that any rendering errors are caught properly
			try {
				const serializedError = serializeError(error);
				response.status(serializedError.statusCode || 500);
				response.set('content-type', 'text/html');
				return response.send(renderErrorPage(serializedError));
				// TODO do we need to call `next` anyway for n-raven to work?
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

/**
 * Render an HTML error info page.
 *
 * @access private
 * @param {serializeError.SerializedError} serializedError
 *     The error to render a page for.
 * @returns {string}
 *     Returns the rendered error page.
 */
function renderErrorPage(serializedError) {
	return `
		<h1>${serializedError.name}: ${serializedError.message}</h1>
		<pre>${serializedError.stack}</pre>
	`;
}

module.exports = createErrorRenderingMiddleware;
