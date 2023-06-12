/**
 * @typedef {import('express').Request} ExpressRequest
 */

/**
 * @typedef {import('http').IncomingMessage} HttpIncomingMessage
 */

/**
 * @typedef {object} BasicRequest
 * @property {Headers | Object<string, string> | Iterable<[string, string]>} [headers]
 *     The request HTTP headers.
 * @property {string} [method]
 *     The request HTTP method.
 * @property {string} [url]
 *     The request URL.
 */

/**
 * @typedef {BasicRequest & Record<string, any> | ExpressRequest | HttpIncomingMessage & Record<string, any>} Request
 */

/**
 * @typedef {object} SerializeRequestOptions
 * @property {Array<string>} [includeHeaders]
 *     An array of request headers to include.
 */

/**
 * @typedef {Object<string, string>} SerializedRequestHeaders
 */

/**
 * @typedef {Object<string, string>} SerializedRequestRouteParams
 */

/**
 * @typedef {object} SerializedRequestRoute
 * @property {string} path
 *     The route path which the request object was matched by.
 * @property {SerializedRequestRouteParams} params
 *     The parameters which were matched in the request path.
 */

/**
 * @typedef {object} SerializedRequest
 * @property {(string|null)} id
 *     A unique identifier for the request.
 * @property {string} method
 *     The HTTP method for the request.
 * @property {string} url
 *     The full path and querystring of the resource being requested.
 * @property {SerializedRequestHeaders} headers
 *     A subset of HTTP headers which came with the request.
 * @property {SerializedRequestRoute} [route]
 *     The express route details.
 */

/**
 * The default request headers to include in the serialization.
 *
 * @public
 * @type {Array<string>}
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
 * Serialize a request object so that it can be consistently logged or output as JSON.
 *
 * @public
 * @param {string | Request} request
 *     The request object to serialize. Either an Express Request object, a
 *     built-in Node.js IncomingMessage object, or an object with the expected
 *     `headers`, `method`, and `url` properties.
 * @param {SerializeRequestOptions} [options = {}]
 *     Options to configure the serialization.
 * @returns {SerializedRequest}
 *     Returns the serialized request object.
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

	// If set, request URL is cast to a string
	if (request.url) {
		requestProperties.url = `${request.url}`;
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
 * @private
 * @param {Headers | Record<string, any> | Iterable<[string, string]>} headers
 *     The headers object to serialize.
 * @param {Array<string>} includeHeaders
 *     An array of request headers to include.
 * @returns {SerializedRequestHeaders}
 *     Returns the serialized request headers.
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
 * @private
 * @param {Record<string, any>} properties
 *     The properties of the serialized error.
 * @returns {SerializedRequest}
 *     Returns the serialized error object.
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
 * @param {any} value
 *     The value to test.
 * @returns {value is Iterable<[string, string]>}
 *     Returns whether a value is iterable.
 */
function isIterableHeadersObject(value) {
	return value && typeof value?.[Symbol.iterator] === 'function';
}

module.exports = serializeRequest;

// We freeze this object so that we avoid any side-effects
// introduced by the way Node.js caches modules. If this
// array is edited within a dependent app, then any changes
// will apply to _all_ uses of `serializeRequest`. This
// could cause some weird issues so we lock it down.
module.exports.DEFAULT_INCLUDED_HEADERS = Object.freeze([
	...DEFAULT_INCLUDED_HEADERS
]);

// @ts-ignore
module.exports.default = module.exports;
