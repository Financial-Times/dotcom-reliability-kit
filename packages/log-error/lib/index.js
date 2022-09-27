/**
 * @module @dotcom-reliability-kit/log-error
 */

const appInfo = require('@dotcom-reliability-kit/app-info');
const logger = require('@financial-times/n-logger').default;
const serializeError = require('@dotcom-reliability-kit/serialize-error');
const serializeRequest = require('@dotcom-reliability-kit/serialize-request');

/**
 * @typedef {object} ErrorLoggingOptions
 * @property {(string | Error & Record<string, any>)} error
 *     The error to log.
 * @property {Array<string>} [includeHeaders]
 *     An array of request headers to include in the log.
 * @property {(string | import('@dotcom-reliability-kit/serialize-request').Request)} [request]
 *     An request object to include in the log.
 */

/**
 * @typedef {object} InternalErrorLoggingOptions
 * @property {string} event
 *     The event to log.
 * @property {("error" | "warn")} [level="error"]
 *     The log level to use. One of "error" or "warn".
 */

/**
 * Log an error object with optional request information.
 *
 * @access private
 * @param {ErrorLoggingOptions & InternalErrorLoggingOptions} options
 *     The data to log.
 * @returns {void}
 */
function logError({ error, event, includeHeaders, level = 'error', request }) {
	const serializedError = serializeError(error);
	const logData = {
		event,
		message: extractErrorMessage(serializedError),
		error: serializedError,
		app: {
			commit: appInfo.commitHash,
			name: appInfo.systemCode,
			nodeVersion: process.versions.node,
			region: appInfo.region,
			releaseDate: appInfo.releaseDate
		}
	};
	if (request) {
		logData.request = serializeRequest(request, { includeHeaders });
	}

	logger.log(level, logData);
}

/**
 * Get a human readable error message from a serialized error object.
 *
 * @access private
 * @param {serializeError.SerializedError} serializedError
 *     The serialized error to get a message for.
 * @returns {string}
 *     Returns the human readable error message.
 */
function extractErrorMessage(serializedError) {
	return `${serializedError.name || 'Error'}${
		serializedError.message ? `: ${serializedError.message}` : ''
	}`;
}

/**
 * Log a handled error.
 *
 * @access public
 * @param {ErrorLoggingOptions} options
 *     The data to log.
 * @returns {void}
 */
function logHandledError({ error, includeHeaders, request }) {
	logError({
		error,
		event: 'HANDLED_ERROR',
		includeHeaders,
		request
	});
}

/**
 * Log a recoverable error.
 *
 * @access public
 * @param {ErrorLoggingOptions} options
 *     The data to log.
 * @returns {void}
 */
function logRecoverableError({ error, includeHeaders, request }) {
	logError({
		error,
		event: 'RECOVERABLE_ERROR',
		includeHeaders,
		level: 'warn',
		request
	});
}

/**
 * Log an unhandled error.
 *
 * @access public
 * @param {ErrorLoggingOptions} options
 *     The data to log.
 * @returns {void}
 */
function logUnhandledError({ error, includeHeaders, request }) {
	logError({
		error,
		event: 'UNHANDLED_ERROR',
		includeHeaders,
		request
	});
}

exports.logHandledError = logHandledError;
exports.logRecoverableError = logRecoverableError;
exports.logUnhandledError = logUnhandledError;

exports.default = exports;
