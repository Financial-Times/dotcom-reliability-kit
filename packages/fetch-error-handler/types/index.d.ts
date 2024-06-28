import { Writable } from 'stream';

declare module '@dotcom-reliability-kit/fetch-error-handler' {
	export type ErrorHandlerOptions = {
		upstreamSystemCode?: string;
	};

	type NodeFetchResponseBody = {
		pipe?: (stream: Writable) => void;
	};

	type FetchResponse = {
		ok: boolean;
		status: number;
		url: string;
		body: NodeFetchResponseBody | ReadableStream<Uint8Array> | null;
	};

	export type FetchErrorHandler = <Response extends FetchResponse>(
		fetchPromise: Response | Promise<Response>
	) => Promise<Response>;

	export function createFetchErrorHandler(
		options?: ErrorHandlerOptions
	): FetchErrorHandler;

	export const handleFetchErrors: FetchErrorHandler;
}
