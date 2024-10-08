const appInfo = require('@dotcom-reliability-kit/app-info');
const { logRecoverableError } = require('@dotcom-reliability-kit/log-error');
const renderErrorPage = require('./render-error-page');
const serializeError = require('@dotcom-reliability-kit/serialize-error');
const { STATUS_CODES } = require('node:http');

/**
 * @import { ErrorRenderingOptions } from '@dotcom-reliability-kit/middleware-render-error-info'
 * @import { ErrorRequestHandler as ExpressErrorHandler } from 'express'
 */

/**
 * Create a middleware function to render an error info page.
 *
 * @param {ErrorRenderingOptions} [options]
 * @returns {ExpressErrorHandler}
 */
function createErrorRenderingMiddleware(options = {}) {
	return function errorRenderingMiddleware(error, request, response, next) {
		// If headers have been sent already then we need to hand off to
		// the final Express error handler as documented here:
		// https://expressjs.com/en/guide/error-handling.html#the-default-error-handler
		//
		// This ensures that the app doesn't crash with `ERR_STREAM_WRITE_AFTER_END`
		if (response.headersSent) {
			return next(error);
		}

		// Serialize the error and extract the status code
		const serializedError = serializeError(error);
		let statusCode = serializedError.statusCode || 500;

		// If the error has a status code of less than `400` we
		// should default to `500` to ensure bad error handling
		// doesn't send false positive status codes. We also check
		// that the status code is a valid number.
		if (
			Number.isNaN(statusCode) || // Possible if `error.status` is something unexpected, like an object
			statusCode < 400 ||
			statusCode > 599
		) {
			statusCode = 500;
		}

		// Set the response status to match the error status code and
		// always send HTML
		response.status(statusCode);
		response.set('content-type', 'text/html');

		// If the error has a fingerprint, output it as a header to aid debugging in production
		if (serializedError.fingerprint) {
			response.set('error-fingerprint', serializedError.fingerprint);
		}

		// Render a full error page in non-production environments
		if (appInfo.environment === 'development') {
			// It's unlikely that this will fail but we want to be sure
			// that any rendering errors are caught properly
			try {
				// Render an HTML error page
				response.send(
					renderErrorPage({
						request,
						response,
						serializedError
					})
				);
				return;
			} catch (/** @type {any} */ renderingError) {
				logRecoverableError({
					error: renderingError,
					logger: options.logger,
					request
				});
			}
		}

		// Either rendering has failed or we're in production. We render a
		// heavily stripped back error
		const statusMessage = STATUS_CODES[statusCode] || STATUS_CODES[500];
		let output = `${statusCode} ${statusMessage}\n`;

		// If the error has a fingerprint, add it to the output
		if (serializedError.fingerprint) {
			output += `(error code: ${serializedError.fingerprint})\n`;
		}

		response.send(output);
	};
}

module.exports = createErrorRenderingMiddleware;

module.exports.default = module.exports;
