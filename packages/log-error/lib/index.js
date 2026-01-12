const appInfo = require('@dotcom-reliability-kit/app-info');
const reliabilityKitLogger = require('@dotcom-reliability-kit/logger');
const serializeError = require('@dotcom-reliability-kit/serialize-error');
const serializeRequest = require('@dotcom-reliability-kit/serialize-request');

/**
 * @import { ErrorLoggingOptions } from '@dotcom-reliability-kit/log-error'
 * @import { SerializedError } from '@dotcom-reliability-kit/serialize-error'
 */

/**
 * Log an error object with optional request information.
 *
 * @private
 * @param {Omit<ErrorLoggingOptions, 'error'> & {error: SerializedError, event: string, level: 'error' | 'fatal' | 'warn'}} options
 *     The data to log.
 * @returns {void}
 */
function logError({ error, event, includeHeaders, level, logger = reliabilityKitLogger, request }) {
	const logData = {
		event,
		message: extractErrorMessage(error),
		error,
		app: {
			commit: appInfo.commitHash,
			name: appInfo.systemCode,
			nodeVersion: process.versions.node,
			region: appInfo.region,
			releaseDate: appInfo.releaseDate,
			processType: appInfo.processType
		}
	};
	if (request) {
		logData.request = serializeRequest(request, { includeHeaders });
	}

	try {
		const logMethod = logger[level] || logger.error;
		logMethod.call(logger, logData);
	} catch (/** @type {any} */ loggingError) {
		// biome-ignore lint/suspicious/noConsole: a fallback to log when logging is broken
		console.log(
			JSON.stringify({
				level: 'error',
				event: 'LOG_METHOD_FAILURE',
				message: `Failed to log at level '${level}'`,
				error: serializeError(loggingError)
			})
		);
		// biome-ignore lint/suspicious/noConsole: a fallback to log when logging is broken
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
 * @type {typeof import('@dotcom-reliability-kit/log-error').logHandledError}
 */
function logHandledError({
	error,
	includeHeaders,
	logger,
	logUserErrorsAsWarnings = false,
	request
}) {
	const serializedError = serializeError(error);
	logError({
		error: serializedError,
		event: 'HANDLED_ERROR',
		includeHeaders,
		level: logUserErrorsAsWarnings && isUserError(serializedError) ? 'warn' : 'error',
		logger,
		request
	});
}

/**
 * Log a recoverable error.
 *
 * @type {typeof import('@dotcom-reliability-kit/log-error').logHandledError}
 */
function logRecoverableError({ error, includeHeaders, logger, request }) {
	const serializedError = serializeError(error);
	logError({
		error: serializedError,
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
 * @type {typeof import('@dotcom-reliability-kit/log-error').logHandledError}
 */
function logUnhandledError({ error, includeHeaders, logger, request }) {
	const serializedError = serializeError(error);
	logError({
		error: serializedError,
		event: 'UNHANDLED_ERROR',
		includeHeaders,
		level: 'fatal',
		logger,
		request
	});
}

/**
 * @param {SerializedError} error
 * @returns {boolean}
 */
function isUserError(error) {
	return error.statusCode !== null && error.statusCode >= 400 && error.statusCode < 500;
}

exports.logHandledError = logHandledError;
exports.logRecoverableError = logRecoverableError;
exports.logUnhandledError = logUnhandledError;

exports.default = exports;
