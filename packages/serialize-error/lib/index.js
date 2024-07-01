const crypto = require('node:crypto');

/**
 * @import { ErrorLike, SerializedError } from '@dotcom-reliability-kit/serialize-error'
 */

/**
 * Serialize an error object so that it can be consistently logged or output as JSON.
 *
 * @param {ErrorLike} error
 * @returns {SerializedError}
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

	// If an AggregateError, serialise its errors (needs to come after checking
	// other properties, otherwise Typescript will widen the type to an intersection
	// with AggregateError which prevents `& Record<string, any>` bit working)
	if (error instanceof AggregateError) {
		errorProperties.errors = error.errors.map(serializeError);
	}

	return createSerializedError(errorProperties);
}

/**
 * Create a new serialized error object.
 *
 * @param {Record<string, any>} properties
 * @returns {SerializedError}
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

module.exports = serializeError;
module.exports.default = module.exports;
