declare module '@dotcom-reliability-kit/serialize-error' {
	export type ErrorLike = string | (Error & Record<string, any>);

	export type SerializedError = {
		fingerprint: string | null;
		name: string;
		code: string;
		message: string;
		isOperational: boolean;
		relatesToSystems: string[];
		cause: Error | null;
		stack: string | null;
		statusCode: number | null;
		data: {
			[key: string]: any;
		};
	};

	export default function serializeError(error: ErrorLike): SerializedError;

	export = serializeError;
}
