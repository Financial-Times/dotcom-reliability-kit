/**
 * @module @dotcom-reliability-kit/serialize-error
 */

/**
 * @typedef {Object} SerializedError
 * @property {String} name
 *     The name of the class that the error is an instance of.
 * @property {String} code
 *     A machine-readable error code which identifies the specific type of error.
 * @property {String} message
 *     A human readable message which describes the error.
 * @property {Boolean} isOperational
 *     Whether the error is operational, as in it's an error we expect sometimes as part of running the application.
 * @property {(String|null)} stack
 *     The full error stack.
 * @property {Number} statusCode
 *     An HTTP status code to represent the error.
 * @property {Object<String, any>} data
 *     Any additional error information.
 */

/**
 * Serialize an error object so that it can be consistently logged or output as JSON.
 *
 * @access public
 * @param {(String|Error & Record<String, any>)} error
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

	// Only include error stack if it's a string
	if (typeof error.stack === 'string') {
		errorProperties.stack = error.stack;
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
 * @access private
 * @param {Record<String, any>} properties
 *     The properties of the serialized error.
 * @returns {SerializedError}
 *     Returns the serialized error object.
 */
function createSerializedError(properties) {
	return Object.assign(
		{},
		{
			name: 'Error',
			code: 'UNKNOWN',
			message: 'An error occurred',
			isOperational: false,
			stack: null,
			statusCode: 500,
			data: {}
		},
		properties
	);
}

module.exports = serializeError;
