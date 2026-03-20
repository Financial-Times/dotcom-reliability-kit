import type { Logger } from '@dotcom-reliability-kit/logger';

declare module '@dotcom-reliability-kit/crash-handler' {
	export type CrashHandlerOptions = {
		logger?: Logger & { [key: string]: any };
		process?: NodeJS.Process;
	};

	export default function registerCrashHandler(options?: CrashHandlerOptions): void;
}
