const { logUnhandledError } = require('@dotcom-reliability-kit/log-error');

/**
 * @typedef {object} CrashHandlerOptions
 * @property {import('@dotcom-reliability-kit/log-error').Logger & {[key: string]: any}} [logger]
 *     The logger to use to output errors. Defaults to n-logger.
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
	process.on('uncaughtException', (error) => {
		logUnhandledError({ error, logger: options.logger });
		process.exit(process.exitCode || 1);
	});
}

module.exports = registerCrashHandler;

module.exports.default = module.exports;
