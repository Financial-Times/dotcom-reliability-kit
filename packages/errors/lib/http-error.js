const OperationalError = require('./operational-error');

/**
 * @import { HttpError as HttpErrorType, HttpErrorData as ErrorData } from '@dotcom-reliability-kit/errors'
 */

/**
 * We have guards in place wherever we use this map of status messages
 * which means we can safely cast it to an object where every property
 * is a string. If we don't do this then TypeScript will complain.
 *
 * @see HttpError.getMessageForStatusCode
 * @type {{[key: string]: any}}
 */
const STATUS_CODES = require('node:http').STATUS_CODES;

/**
 * Class representing an HTTP error.
 */
class HttpError extends OperationalError {
	/**
	 * @override
	 * @readonly
	 * @type {HttpErrorType['name']}
	 */
	name = 'HttpError';

	/**
	 * @readonly
	 * @type {HttpErrorType['statusCode']}
	 */
	statusCode;

	/**
	 * @readonly
	 * @type {HttpErrorType['statusMessage']}
	 */
	statusMessage;

	/**
	 * @type {HttpErrorType['status']}
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
	 * @param {ErrorData} data
	 *     Additional error information.
	 */
	/**
	 * Create an error with a message and optional error data.
	 *
	 * @overload
	 * @param {string} message
	 *     The error message.
	 * @param {ErrorData} [data]
	 *     Additional error information.
	 */
	/**
	 * Create an error with a status and optional error data.
	 *
	 * @overload
	 * @param {number} status
	 *     The error HTTP status code.
	 * @param {ErrorData} [data]
	 *     Additional error information.
	 */
	/**
	 * @param {string | number | ErrorData} [message]
	 *     The error message if it's a string, the HTTP status code if it's a number, or full error
	 *     information if an object.
	 * @param {ErrorData} [data]
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
		super(data);

		// Set the status code and message
		this.statusCode =
			typeof data.statusCode === 'number'
				? HttpError.normalizeErrorStatusCode(data.statusCode)
				: // @ts-ignore TypeScript does not properly infer the constructor
					this.constructor.defaultStatusCode;
		this.statusMessage = HttpError.getMessageForStatusCode(this.statusCode);

		// Default the error code to one that includes the HTTP status
		if (this.code === OperationalError.defaultCode) {
			this.code = `HTTP_${this.statusCode}`;
		}

		// Default the error message to the status message
		if (this.message === OperationalError.defaultMessage) {
			this.message = this.statusMessage;
		}
	}

	/**
	 * Reserved keys that should not appear in `HttpError.prototype.data`.
	 *
	 * @override
	 * @protected
	 * @type {string[]}
	 */
	static reservedKeys = [...OperationalError.reservedKeys, 'statusCode', 'statusMessage'];

	/**
	 * @protected
	 * @readonly
	 * @type {number}
	 */
	static defaultStatusCode = 500;

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
