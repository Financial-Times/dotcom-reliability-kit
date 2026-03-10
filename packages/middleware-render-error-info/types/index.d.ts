import type { Logger } from '@dotcom-reliability-kit/logger';
import type { ErrorRequestHandler } from '@types/express';

declare module '@dotcom-reliability-kit/middleware-render-error-info' {
	export type ErrorRenderingOptions = {
		logger?: Logger & { [key: string]: any };
	};

	export default function createErrorRenderingMiddleware(
		options?: ErrorRenderingOptions
	): ErrorRequestHandler;
}
