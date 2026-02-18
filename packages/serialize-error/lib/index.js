import crypto from 'node:crypto';

/**
 * @import { ErrorLike, SerializedError } from '@dotcom-reliability-kit/serialize-error'
 */

/**
 * Serialize an error object so that it can be consistently logged or output as JSON.
 *
 * @param {unknown} error
 * @returns {SerializedError}
 */
export default function serializeError(error) {
	if (typeof error !== 'object' || Array.isArray(error) || error === null) {
		return createSerializedError({
			message: `${error}`
		});
	}

	const errorProperties = {};

	// If set, error name is cast to a string
	if ('name' in error) {
		errorProperties.name = `${error.name}`;
	}

	// If set, error code is cast to a string
	if ('code' in error) {
		errorProperties.code = `${error.code}`;
	}

	// If set, error message is cast to a string
	if ('message' in error) {
		errorProperties.message = `${error.message}`;
	}

	if ('isOperational' in error) {
		// The `isOperational` property is cast to a boolean
		errorProperties.isOperational = Boolean(error.isOperational);
	}

	// If set, we include the array of related systems
	if ('relatesToSystems' in error && Array.isArray(error.relatesToSystems)) {
		errorProperties.relatesToSystems = error.relatesToSystems;
	}

	// If set, error cause (which in turn is an error instance) is serialized
	if ('cause' in error) {
		errorProperties.cause = serializeError(error.cause);
	}

	// Only include error stack if it's a string
	if ('stack' in error && typeof error.stack === 'string') {
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
	if ('statusCode' in error) {
		errorProperties.statusCode =
			typeof error.statusCode === 'string'
				? parseInt(error.statusCode, 10)
				: error.statusCode;
	} else if ('status' in error) {
		errorProperties.statusCode =
			typeof error.status === 'string' ? parseInt(error.status, 10) : error.status;
	}

	// Only include additional error data if it's defined as an object
	if (
		'data' in error &&
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
