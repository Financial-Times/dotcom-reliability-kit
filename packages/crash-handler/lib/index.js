const {
	logHandledError,
	logUnhandledError
} = require('@dotcom-reliability-kit/log-error');

/**
 * @typedef {object} CrashHandlerOptions
 * @property {import('@dotcom-reliability-kit/log-error').Logger & {[key: string]: any}} [logger]
 *     The logger to use to output errors. Defaults to Reliability Kit logger.
 * @property {import('process')} [process]
 *     The Node.js process to add crash handlers for.
 */

/**
 * Register a crash handler on a process.
 *
 * @public
 * @param {CrashHandlerOptions} [options]
 *     Options to configure the crash handler.
 */
function registerCrashHandler(options = {}) {
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

module.exports = registerCrashHandler;

module.exports.default = module.exports;
