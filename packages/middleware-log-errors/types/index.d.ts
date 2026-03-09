import type { Logger } from '@dotcom-reliability-kit/logger';
import type { ErrorRequestHandler, Request } from 'express';

declare module '@dotcom-reliability-kit/middleware-log-errors' {
	export type ErrorLoggingFilter = (error: any, request: Request) => boolean | undefined;

	export type ErrorLoggingOptions = {
		filter?: ErrorLoggingFilter;
		includeHeaders?: string[];
		logger?: Logger & { [key: string]: any };
		logUserErrorsAsWarnings?: boolean;
	};

	export default function createErrorLoggingMiddleware(
		options?: ErrorLoggingOptions
	): ErrorRequestHandler;
}
