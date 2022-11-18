const appInfo = require('@dotcom-reliability-kit/app-info');
const nLogger = require('@financial-times/n-logger').default;
const serializeError = require('@dotcom-reliability-kit/serialize-error');
const serializeRequest = require('@dotcom-reliability-kit/serialize-request');

/**
 * @typedef {(...logData: any) => any} LogMethod
 */

/**
 * @typedef {object} Logger
 * @property {LogMethod} error
 *     A function to log an error.
 * @property {LogMethod} warn
 *     A function to log a warning.
 */

/**
 * @typedef {object} ErrorLoggingOptions
 * @property {(string | Error & Record<string, any>)} error
 *     The error to log.
 * @property {Array<string>} [includeHeaders]
 *     An array of request headers to include in the log.
 * @property {Logger & Object<string, any>} [logger]
 *     The logger to use to output errors. Defaults to n-logger.
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
 * @private
 * @param {ErrorLoggingOptions & InternalErrorLoggingOptions} options
 *     The data to log.
 * @returns {void}
 */
function logError({
	error,
	event,
	includeHeaders,
	level = 'error',
	logger = nLogger,
	request
}) {
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

	try {
		logger[level](logData);
	} catch (/** @type {any} */ loggingError) {
		// We allow use of `console.log` here to ensure that critical
		// logging failures are caught and logged. This ensures that we
		// know if an app has broken logging.
		// eslint-disable-next-line no-console
		console.log(
			JSON.stringify({
				level: 'error',
				event: 'LOG_METHOD_FAILURE',
				message: `Failed to log at level '${level}'`,
				error: serializeError(loggingError)
			})
		);
		// eslint-disable-next-line no-console
		console.log(JSON.stringify(logData));
	}
}

/**
 * Get a human readable error message from a serialized error object.
 *
 * @private
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
 * @public
 * @param {ErrorLoggingOptions} options
 *     The data to log.
 * @returns {void}
 */
function logHandledError({ error, includeHeaders, logger, request }) {
	logError({
		error,
		event: 'HANDLED_ERROR',
		includeHeaders,
		logger,
		request
	});
}

/**
 * Log a recoverable error.
 *
 * @public
 * @param {ErrorLoggingOptions} options
 *     The data to log.
 * @returns {void}
 */
function logRecoverableError({ error, includeHeaders, logger, request }) {
	logError({
		error,
		event: 'RECOVERABLE_ERROR',
		includeHeaders,
		level: 'warn',
		logger,
		request
	});
}

/**
 * Log an unhandled error.
 *
 * @public
 * @param {ErrorLoggingOptions} options
 *     The data to log.
 * @returns {void}
 */
function logUnhandledError({ error, includeHeaders, logger, request }) {
	logError({
		error,
		event: 'UNHANDLED_ERROR',
		includeHeaders,
		logger,
		request
	});
}

exports.logHandledError = logHandledError;
exports.logRecoverableError = logRecoverableError;
exports.logUnhandledError = logUnhandledError;

exports.default = exports;
