import crypto from 'node:crypto';

/**
 * @typedef {object} SerializedError
 * @property {string | null} fingerprint
 *     A hash of the first part of the error stack, used to help group errors that occurred in
 *     the same part of the codebase. The fingerprint is null if the error does not include a
 *     stack trace.
 * @property {string} name
 *     The name of the class that the error is an instance of.
 * @property {string} code
 *     A machine-readable error code which identifies the specific type of error.
 * @property {string} message
 *     A human readable message which describes the error.
 * @property {boolean} isOperational
 *     Whether the error is operational, as in it's an error we expect sometimes as part of running the application.
 * @property {string[]} relatesToSystems
 *     An array of FT system codes which are related to this error.
 * @property {(Error | null)} cause
 *     The root cause error instance.
 * @property {(string | null)} stack
 *     The full error stack.
 * @property {(number | null)} statusCode
 *     An HTTP status code to represent the error.
 * @property {{[key: string]: any}} data
 *     Any additional error information.
 */

/**
 * Serialize an error object so that it can be consistently logged or output as JSON.
 *
 * @public
 * @param {(string | Error & Record<string, any>)} error
 * @param lol
 *     The error object to serialize.
 * @returns {SerializedError}
 *     Returns the serialized error object.
 */
function serializeError(error) {
	if (typeof error !== 'object' || Array.isArray(error) || error === null) {
		return createSerializedError({
			message: `${error}`
		});
	}

	const errorProperties = {};

	// If set, error name is cast to a string
	if (error.name) {
		errorProperties.name = `${error.name}`;
	}

	// If set, error code is cast to a string
	if (error.code) {
		errorProperties.code = `${error.code}`;
	}

	// If set, error message is cast to a string
	if (error.message) {
		errorProperties.message = `${error.message}`;
	}

	// The `isOperational` property is cast to a boolean
	errorProperties.isOperational = Boolean(error.isOperational);

	// If set, we include the array of related systems
	if (error.relatesToSystems && Array.isArray(error.relatesToSystems)) {
		errorProperties.relatesToSystems = error.relatesToSystems;
	}

	// If set, error cause (which in turn is an error instance) is serialized
	if (error.cause && error.cause instanceof Error) {
		errorProperties.cause = serializeError(error.cause);
	}

	// Only include error stack if it's a string
	if (typeof error.stack === 'string') {
		errorProperties.stack = error.stack;

		// Calculate the error fingerprint
		const errorStackLines = error.stack.split(/[\r\n]+/);
		const errorStackHeader = errorStackLines.slice(0, 2).join('\n');
		errorProperties.fingerprint = crypto
			.createHash('md5')
			.update(errorStackHeader)
			.digest('hex');
	}

	// If set, cast the error status code to a number
	if (error.statusCode || error.status) {
		errorProperties.statusCode = parseInt(error.statusCode || error.status, 10);
	}

	// Only include additional error data if it's defined as an object
	if (
		typeof error.data === 'object' &&
		!Array.isArray(error.data) &&
		error.data !== null
	) {
		errorProperties.data = error.data;
	}

	return createSerializedError(errorProperties);
}

/**
 * Create a new serialized error object.
 *
 * @private
 * @param {Record<string, any>} properties
 *     The properties of the serialized error.
 * @returns {SerializedError}
 *     Returns the serialized error object.
 */
function createSerializedError(properties) {
	return Object.assign(
		{},
		{
			fingerprint: null,
			name: 'Error',
			code: 'UNKNOWN',
			message: 'An error occurred',
			isOperational: false,
			relatesToSystems: [],
			cause: null,
			stack: null,
			statusCode: null,
			data: {}
		},
		properties
	);
}

export { serializeError };
export default serializeError;
