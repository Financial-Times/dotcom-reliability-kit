declare module '@dotcom-reliability-kit/serialize-error' {
	type RelaxedError = string | (Error & { [key: string]: any });

	export interface SerializedError {
		fingerprint: string | null;
		name: string;
		code: string;
		message: string;
		isOperational: boolean;
		relatesToSystems: string[];
		cause: Error | null;
		stack: string | null;
		statusCode: number | null;
		data: { [key: string]: any };
	}

	declare function serializeError(error: RelaxedError): SerializedError;
	export = serializeError;
}
