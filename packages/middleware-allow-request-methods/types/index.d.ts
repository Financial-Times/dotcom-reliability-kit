import type { RequestHandler } from '@types/express';

declare module '@dotcom-reliability-kit/middleware-allow-request-methods' {
	export type RequestMethodOptions = {
		allowedMethods: string[];
	};

	export function allowRequestMethods(options: RequestMethodOptions): RequestHandler;
}
