declare module '@dotcom-reliability-kit/errors' {
	type BaseErrorData = {
		code?: string;
		message?: string;
		cause?: any;
	} & { [key: string]: any };

	type OperationalErrorData = { relatesToSystems?: string[] } & BaseErrorData;

	type HttpErrorData = { statusCode?: number } & OperationalErrorData;

	export class BaseError extends Error {
		constructor();
		constructor(data: BaseErrorData);
		constructor(message: string, data?: BaseErrorData);

		public override readonly name: string;
		public readonly isOperational: boolean;
		public readonly code: string;
		public readonly cause: any;
		public readonly data: { [key: string]: any };

		public static isErrorMarkedAsOperational(error: Error): boolean;
	}

	export class OperationalError extends BaseError {
		constructor();
		constructor(data: OperationalErrorData);
		constructor(message: string, data?: OperationalErrorData);

		public readonly relatesToSystems: string[];
	}

	export class HttpError extends OperationalError {
		constructor();
		constructor(data: HttpErrorData);
		constructor(message: string, data?: HttpErrorData);
		constructor(status: number, data?: HttpErrorData);

		public readonly statusCode: number;
		public readonly statusMessage: string;
		public readonly status: number;
	}

	export class DataStoreError extends OperationalError {}
	export class UpstreamServiceError extends HttpError {}
	export class UserInputError extends HttpError {}

	export default {
		BaseError,
		DataStoreError,
		HttpError,
		OperationalError,
		UpstreamServiceError,
		UserInputError
	};
}
