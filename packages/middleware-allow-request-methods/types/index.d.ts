import { RequestHandler } from 'express';

declare module '@dotcom-reliability-kit/middleware-allow-request-methods' {
	export type RequestMethodOptions = {
		allowedMethods: string[];
	};

	declare function allowRequestMethods(
		options: RequestMethodOptions
	): RequestHandler;
}
