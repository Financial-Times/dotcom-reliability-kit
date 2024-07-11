import { Request } from '@dotcom-reliability-kit/serialize-request';

declare module '@dotcom-reliability-kit/log-error' {
	type LogMethod = (...logData: any) => any;

	export type Logger = {
		error: LogMethod;
		fatal?: LogMethod;
		warn: LogMethod;
	};

	export type ErrorLoggingOptions = {
		error: string | (Error & Record<string, any>);
		includeHeaders?: string[];
		logger?: Logger & { [key: string]: any };
		request?: string | Request;
	};

	export type HandledErrorLoggingOptions = ErrorLoggingOptions & {
		logUserErrorsAsWarnings?: boolean;
	};

	export function logHandledError(options: HandledErrorLoggingOptions): void;

	export function logRecoverableError(options: ErrorLoggingOptions): void;

	export function logUnhandledError(options: ErrorLoggingOptions): void;
}
