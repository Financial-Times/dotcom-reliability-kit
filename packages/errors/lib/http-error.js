const OperationalError = require('./operational-error');

/**
 * We have guards in place wherever we use this map of status messages
 * which means we can safely cast it to an object where every property
 * is a string. If we don't do this then TypeScript will complain.
 *
 * @see HttpError.getMessageForStatusCode
 * @type {Object<any, string>}
 */
const STATUS_CODES = require('http').STATUS_CODES;

/**
 * @typedef {object} HttpErrorStrictData
 * @property {number} [statusCode]
 *     An HTTP status code.
 */

/**
 * @typedef {HttpErrorStrictData & OperationalError.OperationalErrorData} HttpErrorData
 */

/**
 * Class representing an HTTP error.
 */
class HttpError extends OperationalError {
	/**
	 * @override
	 * @readonly
	 * @public
	 * @type {string}
	 */
	name = 'HttpError';

	/**
	 * @readonly
	 * @public
	 * @type {number}
	 */
	statusCode = 500;

	/**
	 * @readonly
	 * @public
	 * @type {string}
	 */
	statusMessage = STATUS_CODES[500];

	/**
	 * @public
	 * @type {number}
	 */
	get status() {
		return this.statusCode;
	}

	/**
	 * Create an error with no arguments.
	 *
	 * @overload
	 */
	/**
	 * Create an error with error data.
	 *
	 * @overload
	 * @param {HttpErrorData} data
	 *     Additional error information.
	 */
	/**
	 * Create an error with a message and optional error data.
	 *
	 * @overload
	 * @param {string} message
	 *     The error message.
	 * @param {HttpErrorData} [data]
	 *     Additional error information.
	 */
	/**
	 * Create an error with a status and optional error data.
	 *
	 * @overload
	 * @param {number} status
	 *     The error HTTP status code.
	 * @param {HttpErrorData} [data]
	 *     Additional error information.
	 */
	/**
	 * @param {string | number | HttpErrorData} [message]
	 *     The error message if it's a string, the HTTP status code if it's a number, or full error
	 *     information if an object.
	 * @param {HttpErrorData} [data]
	 *     Additional error information if `message` is a string or number.
	 */
	constructor(message, data = {}) {
		if (typeof message === 'string') {
			data.message = message;
		} else if (typeof message === 'number') {
			data.statusCode = message;
		} else {
			data = message || data;
		}

		// Make sure that we don't modify the original data object
		// by shallow-cloning it
		data = { ...data };

		// Default the status code
		data.statusCode =
			typeof data.statusCode === 'number'
				? HttpError.normalizeErrorStatusCode(data.statusCode)
				: 500;

		// Default the error code
		data.code =
			typeof data.code === 'string' ? data.code : `HTTP_${data.statusCode}`;

		// Default the error message
		data.message =
			typeof data.message === 'string'
				? data.message
				: HttpError.getMessageForStatusCode(data.statusCode);

		// Message and code are set by the parent class, but we need
		// to set the status code and message properties ourselves
		super(data);
		this.statusCode = data.statusCode;
		this.statusMessage = HttpError.getMessageForStatusCode(data.statusCode);
	}

	/**
	 * Reserved keys that should not appear in `HttpError.prototype.data`.
	 *
	 * @override
	 * @protected
	 * @type {Array<string>}
	 */
	static reservedKeys = [
		...OperationalError.reservedKeys,
		'statusCode',
		'statusMessage'
	];

	/**
	 * Normalize an HTTP status code.
	 *
	 * @protected
	 * @param {number} statusCode
	 *     The HTTP status code to normalize.
	 * @returns {number}
	 *     Returns the normalized HTTP status code.
	 */
	static normalizeErrorStatusCode(statusCode) {
		statusCode = Math.floor(statusCode);
		if (statusCode < 400 || statusCode > 599) {
			statusCode = 500;
		}
		return statusCode;
	}

	/**
	 * Get the HTTP message for a given status code.
	 *
	 * @private
	 * @param {number} statusCode
	 *     The HTTP status code to get a message for.
	 * @returns {string}
	 *     Returns the message.
	 */
	static getMessageForStatusCode(statusCode) {
		if (STATUS_CODES[statusCode]) {
			return STATUS_CODES[statusCode];
		}
		if (statusCode >= 400 && statusCode <= 499) {
			return STATUS_CODES[400];
		}
		return STATUS_CODES[500];
	}
}

module.exports = HttpError;

module.exports.default = module.exports;
