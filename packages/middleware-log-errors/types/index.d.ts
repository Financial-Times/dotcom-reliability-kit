import { ErrorRequestHandler, Request } from 'express';
import { Logger } from '@dotcom-reliability-kit/logger';

declare module '@dotcom-reliability-kit/middleware-log-errors' {
	export type ErrorLoggingFilter = (
		error: any,
		request: Request
	) => boolean | void;

	export type ErrorLoggingOptions = {
		filter?: ErrorLoggingFilter;
		includeHeaders?: string[];
		logger?: Logger & { [key: string]: any };
		logUserErrorsAsWarnings?: boolean;
	};

	declare function createErrorLoggingMiddleware(
		options?: ErrorLoggingOptions
	): ErrorRequestHandler;

	export default createErrorLoggingMiddleware;
	export = createErrorLoggingMiddleware;
}
