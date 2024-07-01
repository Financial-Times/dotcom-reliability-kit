/**
 * @import {
 *   Request,
 *   RequestHeaders,
 *   SerializedRequest,
 *   SerializedRequestHeaders,
 *   SerializeRequestOptions
 * } from '@dotcom-reliability-kit/serialize-request'
 */

const DEFAULT_INCLUDED_HEADERS = [
	'accept',
	'accept-encoding',
	'accept-language',
	'content-type',
	'referer',
	'user-agent'
];

/**
 * The maximum length of a URL, any longer than this will be truncated.
 */
const URL_TRUNCATION_LENGTH = 200;

/**
 * Serialize a request object so that it can be consistently logged or output as JSON.
 *
 * @param {Request} request
 * @param {SerializeRequestOptions} options
 * @returns {SerializedRequest}
 */
function serializeRequest(request, options = {}) {
	// If the request is not an object, assume it's the request
	// URL and return early
	if (
		typeof request !== 'object' ||
		Array.isArray(request) ||
		request === null
	) {
		return createSerializedRequest({
			url: `${request}`
		});
	}

	// Default and validate the included headers
	let includeHeaders = options?.includeHeaders || DEFAULT_INCLUDED_HEADERS;
	if (
		!Array.isArray(includeHeaders) ||
		!includeHeaders.every((header) => typeof header === 'string')
	) {
		throw new TypeError(
			'The `includeHeaders` option must be an array of strings'
		);
	}
	includeHeaders = includeHeaders.map((header) => header.toLowerCase());

	const requestProperties = {};

	// If set, request ID is cast to a string
	if (request.headers?.['x-request-id']) {
		requestProperties.id = `${request.headers?.['x-request-id']}`;
	}

	// If set, request method is cast to a string and upper-cased
	if (request.method) {
		requestProperties.method = `${request.method}`.toUpperCase();
	}

	// If set, request URL is cast to a string and truncated to avoid
	// us exceeding log event size limits
	if (request.url) {
		let url = `${request.url}`;
		if (url.length > URL_TRUNCATION_LENGTH) {
			url = url.slice(0, URL_TRUNCATION_LENGTH) + ' [truncated]';
		}
		requestProperties.url = url;
	}

	// Serialize the headers
	const headersIsObject =
		typeof request.headers === 'object' &&
		!Array.isArray(request.headers) &&
		request.headers !== null;
	if (
		request.headers &&
		(headersIsObject || isIterableHeadersObject(request.headers))
	) {
		requestProperties.headers = serializeHeaders(
			request.headers,
			includeHeaders
		);
	}

	// If the request route is present and valid, add it
	if (request.route && typeof request.route.path === 'string') {
		requestProperties.route = {
			path: request.route.path,
			params: request.params || {}
		};
	}

	return createSerializedRequest(requestProperties);
}

/**
 * Serialize request headers.
 *
 * @param {RequestHeaders} headers
 * @param {string[]} includeHeaders
 * @returns {SerializedRequestHeaders}
 */
function serializeHeaders(headers, includeHeaders) {
	const headersObject = {};
	let iterableHeaders =
		Array.isArray(headers) || isIterableHeadersObject(headers)
			? headers
			: Object.entries(headers);

	for (const [header, value] of iterableHeaders) {
		if (typeof header === 'string' && typeof value === 'string') {
			headersObject[header.toLowerCase()] = value;
		}
	}

	return Object.fromEntries(
		Object.entries(headersObject).filter(([header]) =>
			includeHeaders.includes(header)
		)
	);
}

/**
 * Create a new serialized request object.
 *
 * @param {{[key: string]: any}} properties
 * @returns {SerializedRequest}
 */
function createSerializedRequest(properties) {
	return Object.assign(
		{},
		{
			id: null,
			method: '-',
			url: '/',
			headers: {}
		},
		properties
	);
}

/**
 * Check whether a value is an iterable request headers object.
 *
 * @param {any} value
 * @returns {value is Iterable<[string, string]>}
 */
function isIterableHeadersObject(value) {
	return value && typeof value?.[Symbol.iterator] === 'function';
}

module.exports = serializeRequest;
module.exports.default = module.exports;

// We freeze this object so that we avoid any side-effects
// introduced by the way Node.js caches modules. If this
// array is edited within a dependent app, then any changes
// will apply to _all_ uses of `serializeRequest`. This
// could cause some weird issues so we lock it down.
module.exports.DEFAULT_INCLUDED_HEADERS = Object.freeze([
	...DEFAULT_INCLUDED_HEADERS
]);
