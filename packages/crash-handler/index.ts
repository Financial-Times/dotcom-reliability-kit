import { logHandledError, logUnhandledError } from '@dotcom-reliability-kit/log-error';
import type { Logger } from '@dotcom-reliability-kit/logger';

type CrashHandlerOptions = {
	logger?: Logger & { [key: string]: any };
	process?: NodeJS.Process;
};

/**
 * Register a crash handler on a process.
 */
export default function registerCrashHandler(options: CrashHandlerOptions = {}) {
	const process = options.process || global.process;
	const logger = options.logger;

	// Don't register Crash Handler if there are already uncaught exception handlers.
	// This is to prevent double registering crash handler as well as to avoid any
	// side-effects that are caused by multiple uncaughtException handlers being set.
	const existingListeners = [
		...process.listeners('uncaughtException'),
		...process.listeners('unhandledRejection')
	];
	if (existingListeners.length) {
		logHandledError({
			error: Object.assign(
				new Error(
					'Crash Handler cannot be used alongside other uncaughtException or unhandledRejection handlers'
				),
				{ code: 'CRASH_HANDLER_NOT_REGISTERED' }
			),
			logger
		});
		return;
	}

	process.on('uncaughtException', (error) => {
		logUnhandledError({ error, logger });
		process.exit(process.exitCode || 1);
	});
}
