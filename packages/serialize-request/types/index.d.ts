declare module '@dotcom-reliability-kit/serialize-request' {
	type SerializeRequestOptions = {
		includeHeaders?: string[];
	};

	type RequestHeaders =
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

	type Request =
		| (BasicRequest & { [key: string]: any })
		| ExpressRequest
		| (NodeHttpRequest & { [key: string]: any });

	type SerializedRequest = {
		id: string | null;
		method: string;
		url: string;
		headers: SerializedRequestHeaders;
		route?: SerializedRequestRoute;
	};
	type SerializedRequestHeaders = { [key: string]: string };
	type SerializedRequestRouteParams = { [key: string]: string };
	type SerializedRequestRoute = {
		path: string;
		params: SerializedRequestRouteParams;
	};

	export default function serializeRequest(
		request: string | Request,
		options?: SerializeRequestOptions
	): SerializedRequest;

	export const DEFAULT_INCLUDED_HEADERS: readonly string[];
}
