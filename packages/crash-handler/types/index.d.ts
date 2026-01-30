import { Logger } from '@dotcom-reliability-kit/logger';

declare module '@dotcom-reliability-kit/crash-handler' {
	export type CrashHandlerOptions = {
		logger?: Logger & { [key: string]: any };
		process?: NodeJS.Process;
	};

	declare function registerCrashHandler(options?: CrashHandlerOptions): void;

	export default registerCrashHandler;
}
