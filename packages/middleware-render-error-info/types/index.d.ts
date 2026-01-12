import { Logger } from '@dotcom-reliability-kit/logger';
import { ErrorRequestHandler } from '@types/express';

declare module '@dotcom-reliability-kit/middleware-render-error-info' {
	export type ErrorRenderingOptions = {
		logger?: Logger & { [key: string]: any };
	};

	declare function createErrorRenderingMiddleware(
		options?: ErrorRenderingOptions
	): ErrorRequestHandler;

	export default createErrorRenderingMiddleware;
	export = createErrorRenderingMiddleware;
}
