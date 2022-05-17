/**
 * @module @dotcom-reliability-kit/serialize-request
 */

/**
 * @typedef {import('express').Request | import('http').IncomingMessage & {route: object, params: object}} Request
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
 * @property {string} method
 *     The HTTP method for the request.
 * @property {string} url
 *     The full path and querystring of the resource being requested.
 * @property {SerializedRequestHeaders} headers
 *     A subset of HTTP headers which came with the request.
 * @property {SerializedRequestRoute} [route]
 *     A subset of HTTP headers which came with the request.
 */

/**
 * The default request headers to include in the serialization.
 *
 * @access private
 * @type {Array<string>}
 */
const DEFAULT_INCLUDED_HEADERS = ['accept', 'content-type'];

/**
 * Serialize a request object so that it can be consistently logged or output as JSON.
 *
 * @access public
 * @param {(string | Request)} request
 *     The request object to serialize. Either an Express Request object or a
 *     built-in Node.js IncomingMessage object.
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

	// If set, request method is cast to a string and upper-cased
	if (request.method) {
		requestProperties.method = `${request.method}`.toUpperCase();
	}

	// If set, request URL is cast to a string
	if (request.url) {
		requestProperties.url = `${request.url}`;
	}

	// Serialize the headers
	if (
		request.headers &&
		typeof request.headers === 'object' &&
		!Array.isArray(request.headers) &&
		request.headers !== null
	) {
		requestProperties.headers = serializeHeaders(
			request.headers,
			includeHeaders
		);
	}

	// If the request route is present and valid, add it
	const routePath = request.route?.path;
	if (routePath && typeof routePath === 'string') {
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
 * @access private
 * @param {Record<string, any>} headers
 *     The headers object to serialize.
 * @param {Array<string>} includeHeaders
 *     An array of request headers to include.
 * @returns {SerializedRequestHeaders}
 *     Returns the serialized request headers.
 */
function serializeHeaders(headers, includeHeaders) {
	return Object.fromEntries(
		Object.entries(headers).filter(([header]) =>
			includeHeaders.includes(header)
		)
	);
}

/**
 * Create a new serialized request object.
 *
 * @access private
 * @param {Record<string, any>} properties
 *     The properties of the serialized error.
 * @returns {SerializedRequest}
 *     Returns the serialized error object.
 */
function createSerializedRequest(properties) {
	return Object.assign(
		{},
		{
			method: '-',
			url: '/',
			headers: {}
		},
		properties
	);
}

module.exports = serializeRequest;
