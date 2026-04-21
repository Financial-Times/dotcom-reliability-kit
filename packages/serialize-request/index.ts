import type { IncomingHttpHeaders, IncomingMessage } from 'node:http';
import type { Request as ExpressRequest } from 'express';

// Types to represent input request objects
type RequestHeaders =
	| Headers
	| { [key: string]: string }
	| Iterable<[string, string]>
	| IncomingHttpHeaders;
interface BasicRequest {
	headers?: RequestHeaders;
	method?: string;
	url?: string;
}
export type Request =
	| string
	| (BasicRequest & { [key: string]: any })
	| ExpressRequest
	| (IncomingMessage & { [key: string]: any });

// Types to represent a serialized request object
interface SerializedRequestHeaders {
	[key: string]: string;
}
interface SerializedRequestRouteParams {
	[key: string]: string;
}
interface SerializedRequestRoute {
	path: string;
	params: SerializedRequestRouteParams;
}
interface SerializedRequest {
	id: string | null;
	method: string;
	url: string;
	headers: SerializedRequestHeaders;
	route?: SerializedRequestRoute;
}

export const DEFAULT_INCLUDED_HEADERS = Object.freeze([
	'accept',
	'accept-encoding',
	'accept-language',
	'content-type',
	'host',
	'referer',
	'user-agent'
]);

// The maximum length of a URL, any longer than this will be truncated.
const URL_TRUNCATION_LENGTH = 200;

interface SerializeRequestOptions {
	includeHeaders?: string[];
}

/**
 * Serialize a request object so that it can be consistently logged or output as JSON.
 */
export default function serializeRequest(request: Request, options: SerializeRequestOptions = {}) {
	// If the request is not an object, assume it's the request
	// URL and return early
	if (typeof request !== 'object' || Array.isArray(request) || request === null) {
		return createSerializedRequest({
			url: `${request}`
		});
	}

	// Default and validate the included headers
	let includeHeaders = options?.includeHeaders || [...DEFAULT_INCLUDED_HEADERS];
	if (
		!Array.isArray(includeHeaders) ||
		!includeHeaders.every((header) => typeof header === 'string')
	) {
		throw new TypeError('The `includeHeaders` option must be an array of strings');
	}
	includeHeaders = includeHeaders.map((header) => header.toLowerCase());

	const requestProperties: Partial<SerializedRequest> = {};

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
			url = `${url.slice(0, URL_TRUNCATION_LENGTH)} [truncated]`;
		}
		requestProperties.url = url;
	}

	// Serialize the headers
	const headersIsObject =
		typeof request.headers === 'object' &&
		!Array.isArray(request.headers) &&
		request.headers !== null;
	if (request.headers && (headersIsObject || isIterableHeadersObject(request.headers))) {
		requestProperties.headers = serializeHeaders(request.headers, includeHeaders);
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
 */
function serializeHeaders(
	headers: RequestHeaders,
	includeHeaders: string[]
): SerializedRequestHeaders {
	const headersObject: SerializedRequestHeaders = {};
	const iterableHeaders =
		Array.isArray(headers) || isIterableHeadersObject(headers)
			? headers
			: Object.entries(headers);

	for (const [header, value] of iterableHeaders) {
		if (typeof header === 'string' && typeof value === 'string') {
			headersObject[header.toLowerCase()] = value;
		}
	}

	return Object.fromEntries(
		Object.entries(headersObject).filter(([header]) => includeHeaders.includes(header))
	);
}

/**
 * Create a new serialized request object.
 */
function createSerializedRequest(properties: Partial<SerializedRequest>): SerializedRequest {
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
 */
function isIterableHeadersObject(value: unknown): value is Iterable<[string, string]> {
	return Boolean(value && typeof value?.[Symbol.iterator] === 'function');
}
