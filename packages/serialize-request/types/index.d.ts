declare module '@dotcom-reliability-kit/serialize-request' {
	export type SerializeRequestOptions = {
		includeHeaders?: string[];
	};

	export type RequestHeaders =
		| Headers
		| { [key: string]: string }
		| Iterable<[string, string]>
		| import('http').IncomingHttpHeaders;

	type BasicRequest = {
		headers?: RequestHeaders;
		method?: string;
		url?: string;
	};
	type ExpressRequest = import('express').Request;
	type NodeHttpRequest = import('http').IncomingMessage;

	export type Request =
		| (BasicRequest & { [key: string]: any })
		| ExpressRequest
		| (NodeHttpRequest & { [key: string]: any });

	export type SerializedRequest = {
		id: string | null;
		method: string;
		url: string;
		headers: SerializedRequestHeaders;
		route?: SerializedRequestRoute;
	};
	export type SerializedRequestHeaders = { [key: string]: string };
	export type SerializedRequestRouteParams = { [key: string]: string };
	export type SerializedRequestRoute = {
		path: string;
		params: SerializedRequestRouteParams;
	};

	export default function serializeRequest(
		request: string | Request,
		options?: SerializeRequestOptions
	): SerializedRequest;

	export const DEFAULT_INCLUDED_HEADERS: readonly string[];

	export = serializeRequest;
}
