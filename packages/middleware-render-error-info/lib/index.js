const appInfo = require('@dotcom-reliability-kit/app-info');
const { logRecoverableError } = require('@dotcom-reliability-kit/log-error');
const renderErrorPage = require('./render-error-page');
const serializeError = require('@dotcom-reliability-kit/serialize-error');
const { STATUS_CODES } = require('node:http');

/**
 * @typedef {"full" | "json" | "minimal"} RenderingStyle
 */

/**
 * @typedef {object} ErrorRenderingOptions
 * @property {import('@dotcom-reliability-kit/log-error').Logger & {[key: string]: any}} [logger]
 *     The logger to use to output errors. Defaults to Reliability Kit logger.
 * @property {RenderingStyle} [renderer]
 *     The renderer to use when outputting error information, one of "full", "json", or "minimal".
 *     Defaults to "minimal" if the `NODE_ENV` environment variable is "production", otherwise
 *     defaults to "full".
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
	// Only render full error information if we're in production
	const defaultRenderer =
		appInfo.environment === 'development' ? 'full' : 'minimal';
	const renderer = options.renderer || defaultRenderer;

	return function errorRenderingMiddleware(error, request, response, next) {
		// It's unlikely that this will fail but we want to be sure
		// that any rendering errors are caught properly
		try {
			// If headers have been sent already then we need to hand off to
			// the final Express error handler as documented here:
			// https://expressjs.com/en/guide/error-handling.html#the-default-error-handler
			//
			// This ensures that the app doesn't crash with `ERR_STREAM_WRITE_AFTER_END`
			if (response.headersSent) {
				logRecoverableError({
					error: Object.assign(
						new Error(
							'The error handler could not output because the response has already been sent'
						),
						{ code: 'ERROR_RENDERING_FAILURE' }
					),
					request
				});
				return next(error);
			}

			const serializedError = serializeError(error);

			// Make sure we have a valid status code and then send it
			const statusCode = isValidStatusCode(serializedError.statusCode)
				? serializedError.statusCode
				: 500;
			response.status(statusCode);

			// Render JSON errors if the rendering style is explicitly configured
			if (renderer === 'json') {
				response.set('content-type', 'application/json');
				const jsonResponse = {
					error: {
						name: serializedError.name,
						code: serializedError.code,
						message: serializedError.message
					}
				};
				return response.send(JSON.stringify(jsonResponse, null, '\t'));
			}

			// Render full debug pages in local development
			if (renderer === 'full') {
				response.set('content-type', 'text/html');
				return response.send(
					renderErrorPage({
						request,
						response,
						serializedError
					})
				);
			}

			// Render a minimal error message if in production or if an unexpected
			// rendering style is set.
			response.set('content-type', 'text/plain');
			return response.send(STATUS_CODES[statusCode] || 'Internal Server Error');
		} catch (/** @type {any} */ renderingError) {
			logRecoverableError({
				error: renderingError,
				logger: options.logger,
				request
			});
			return next(renderingError);
		}
	};
}

/**
 * @param {any} statusCode
 *     The status code to check.
 * @returns {statusCode is number}
 *     Returns whether the status code is valid.
 */
function isValidStatusCode(statusCode) {
	return (
		statusCode &&
		// The error status is a number
		!Number.isNaN(statusCode) &&
		// The error status is in range
		statusCode >= 400 &&
		statusCode < 600
	);
}

module.exports = createErrorRenderingMiddleware;
module.exports.default = module.exports;
