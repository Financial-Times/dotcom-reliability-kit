
interface ErrorHandlerOptions {
	upstreamSystemCode: string
}

interface FetchResponse {
	ok: boolean
	status: number
}

type FetchErrorHandler = (fetchPromise: FetchResponse | Promise<FetchResponse>) => Promise<Response>

function createFetchErrorHandler(options?: ErrorHandlerOptions): FetchErrorHandler {
	return async function handleFetchErrors(input) {
		let response = input;

		// If input is a promise, resolve it
		if (input instanceof Promise) {
			response = await input;
		}

		// Check whether the value we were given is a valid response object
		if (!isFetchResponse(response)) {
			// This is not an operational error because the invalid
			// input is highly likely to be a programmer error
			throw Object.assign(
				new TypeError(
					'Fetch handler must be called with a `fetch` response object or a `fetch` promise'
				),
				{ code: 'FETCH_ERROR_HANDLER_INVALID_INPUT' }
			);
		}

		return response;
	};
};

const handleFetchErrors = createFetchErrorHandler();

function isFetchResponse(value: any): value is FetchResponse {
	if (!value || typeof value !== 'object') {
		return false;
	}
	if (typeof value.ok !== 'boolean') {
		return false;
	}
	if (typeof value.status !== 'number') {
		return false;
	}
	return true;
}


(async () => {
	const res1 = await handleFetchErrors({ ok: true, status: 404 });
	res1.headers;

	const res2 = await handleFetchErrors(new Response());
	res2.headers;

	Promise.resolve({ ok: true, status: 404 }).then(handleFetchErrors);
})();
