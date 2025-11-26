declare module '@dotcom-reliability-kit/serialize-error' {
	export type ErrorLike = string | (Error & Record<string, any>);

	export type SerializedError = {
		fingerprint: string | null;
		name: string;
		code: string;
		message: string;
		isOperational: boolean;
		relatesToSystems: string[];
		cause?: unknown;
		errors?: Error[];
		stack: string | null;
		statusCode: number | null;
		data: {
			[key: string]: any;
		};
	};

	export default function serializeError(error: ErrorLike): SerializedError;

	export = serializeError;
}
