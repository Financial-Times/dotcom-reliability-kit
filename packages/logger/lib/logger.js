const pino = require('pino').default;
const serializeError = require('@dotcom-reliability-kit/serialize-error');
const { default: clone } = require('@ungap/structured-clone');
const appInfo = require('@dotcom-reliability-kit/app-info');

/**
 * @typedef {"silly" | "data" | "debug" | "verbose" | "info" | "warn" | "error" | "fatal"} LogLevel
 */

/**
 * @typedef {string | object | Error} LogData
 */

/**
 * @typedef {object} LoggerOptions
 * @property {LogData} [baseLogData = {}]
 *     Base log data which is added to every log output.
 * @property {LogLevel} [logLevel = "debug"]
 *     The maximum log level to output during logging. Logs at levels
 *     beneath this will be ignored.
 * @property {Array<LogTransform>} [transforms = []]
 *     Transforms to apply to logs before sending.
 * @property {boolean} [withTimestamps = true]
 *     Whether to send the timestamp that each log method was called.
 */

/**
 * @typedef {object} PrivateLoggerOptions
 * @property {LogTransport} [_transport]
 *     A transport used to perform logging. This is only for internal use.
 */

/**
 * @callback LogTransform
 * @param {Object<string, any>} logData
 *     The log data to transform.
 * @returns {Object<string, any>}
 *     Returns the transformed log data.
 */

/**
 * @typedef {object} LogTransport
 * @property {string} [level]
 *     A property used to set the transport log level.
 * @property {(...args: any) => any} debug
 *     Log debug level information.
 * @property {(...args: any) => any} error
 *     Log error level information.
 * @property {(...args: any) => any} fatal
 *     Log fatal level information.
 * @property {(...args: any) => any} info
 *     Log info level information.
 * @property {(...args: any) => any} warn
 *     Log warn level information.
 * @property {() => {}} [flush]
 *     Flush async logs ahead of time.
 */

/**
 * @typedef {object} LogLevelInfo
 * @property {LogLevel} logLevel
 *     A canonical alternative level for a given level.
 * @property {boolean} isDeprecated
 *     Whether the original log level is deprecated.
 */

/**
 * A map of log levels to the underlying log method that
 * should be called when a log of that level is sent, as
 * well as the deprecation status of the log level.
 *
 * @type {Object<string, LogLevelInfo>}
 */
const logLevelToTransportMethodMap = {
	data: { logLevel: 'debug', isDeprecated: true },
	debug: { logLevel: 'debug', isDeprecated: false },
	default: { logLevel: 'info', isDeprecated: true },
	error: { logLevel: 'error', isDeprecated: false },
	fatal: { logLevel: 'fatal', isDeprecated: false },
	info: { logLevel: 'info', isDeprecated: false },
	silly: { logLevel: 'debug', isDeprecated: true },
	verbose: { logLevel: 'debug', isDeprecated: true },
	warn: { logLevel: 'warn', isDeprecated: false }
};

// IMPORTANT: increasing this hard-coded value is a breaking
// change, because apps which currently use a pino-pretty
// version lower than the new value will have to upgrade
const PINO_PRETTY_MIN_VERSION = 10;

/**
 * Send a backup log using `console.log`, for when all else fails.
 *
 * @param {Object<string, any>} logData
 *     The information to log.
 */
function sendBackupLog(logData) {
	// We allow use of `console.log` here to ensure that critical
	// logging failures are caught and logged. This ensures that we
	// know if an app has broken logging.
	// eslint-disable-next-line no-console
	console.log(JSON.stringify(logData));
}

/**
 * Whether log prettification is available. This is based
 * on two things: the pino-pretty module being installed
 * in the application, and the `NODE_ENV` environment
 * variable being undefined or "development".
 *
 * @type {boolean}
 */
const PRETTIFICATION_AVAILABLE = (() => {
	try {
		// We have to `require` here so that we can inspect the manifest
		// for pino-pretty to be sure it's a version that we support.
		// See https://github.com/Financial-Times/dotcom-reliability-kit/issues/516#issuecomment-1511117413
		const pinoPrettyManifest = require('pino-pretty/package.json');

		// Check if we have a version of pino-pretty installed that we
		// actually support
		if (typeof pinoPrettyManifest?.version !== 'string') {
			return false;
		}
		const pinoPrettyMajorVersion = Number(
			pinoPrettyManifest?.version.split('.')[0]
		);
		if (Number.isNaN(pinoPrettyMajorVersion)) {
			sendBackupLog({
				level: 'warn',
				event: 'LOG_PRETTIFIER_FAILURE',
				message: 'Could not determine the version of pino-pretty installed'
			});
			return false;
		}
		if (pinoPrettyMajorVersion < PINO_PRETTY_MIN_VERSION) {
			sendBackupLog({
				level: 'warn',
				event: 'LOG_PRETTIFIER_FAILURE',
				message: `The installed version of pino-pretty (v${pinoPrettyMajorVersion}) is not compatible. Please use v${PINO_PRETTY_MIN_VERSION} or above`
			});
			return false;
		}

		// If we get to this point, pino-pretty is installed because
		// otherwise it would have errored. So we can just check for
		// the environment not being "production" (which implies
		// "development", "test" or a similar pre-production term).
		return appInfo.environment !== 'production';
	} catch (_) {
		return false;
	}
})();

/**
 * Class representing a logger.
 */
class Logger {
	/**
	 * @type {LogLevel}
	 */
	#logLevel = 'debug';

	/**
	 * @type {LogData}
	 */
	#baseLogData = {};

	/**
	 * @type {Array<LogTransform>}
	 */
	#transforms = [];

	/**
	 * @type {LogTransport}
	 */
	#logTransport;

	/**
	 * @type {Array<string>}
	 */
	#deprecatedMethodTracker = [];

	/**
	 * Create a logger.
	 *
	 * @param {LoggerOptions & PrivateLoggerOptions} [options = {}]
	 *     Options to configure the logger.
	 */
	constructor(options = {}) {
		// Default and set the base log data option
		if (options.baseLogData) {
			// TODO when we remove `setContext` and `clearContext` we can freeze this
			// object with `Object.freeze` to prevent any editing after instantiation
			this.#baseLogData = clone(options.baseLogData, { lossy: true });
		}

		// Default and set the log level option. We default the log level to the
		// `LOG_LEVEL` environment variable and fall back to `SPLUNK_LOG_LEVEL`
		// for backwards-compatibility with n-logger.
		const logLevelOption =
			options.logLevel || process.env.LOG_LEVEL || process.env.SPLUNK_LOG_LEVEL;
		if (logLevelOption) {
			const { logLevel } = Logger.getLogLevelInfo(logLevelOption);
			this.#logLevel = logLevel;
		}

		// Default and set the transforms option
		if (options.transforms) {
			if (
				!Array.isArray(options.transforms) ||
				!options.transforms.every(
					(transform) => typeof transform === 'function'
				)
			) {
				throw new TypeError(
					'The `transforms` option must be an array of functions'
				);
			}
			this.#transforms = options.transforms;
		}

		// Default and set the timestamps option.
		const withTimestamps = options.withTimestamps !== false;

		if (options._transport) {
			// If we have a configured transport, use it. This means
			// that a child logger was created with an already-instantated
			// Pino logger
			this.#logTransport = options._transport;
		} else {
			// Otherwise set up Pino to replicate n-logger as closely as possible
			/** @type {pino.LoggerOptions} */
			const pinoOptions = {
				base: {},
				formatters: {
					level(label) {
						return { level: label };
					}
				},
				messageKey: 'message', // This is for backwards compatibility with our existing logs
				timestamp: withTimestamps
			};
			if (PRETTIFICATION_AVAILABLE) {
				pinoOptions.transport = {
					target: 'pino-pretty',
					options: {
						colorize: true,
						messageKey: 'message'
					}
				};
			}
			this.#logTransport = pino(pinoOptions);
			this.#logTransport.level = this.#logLevel;
		}
	}

	/**
	 * @public
	 * @type {LogData}
	 */
	get baseLogData() {
		return this.#baseLogData;
	}

	/**
	 * @public
	 * @type {LogLevel}
	 */
	get logLevel() {
		return this.#logLevel;
	}

	/**
	 * @public
	 * @type {LogTransport}
	 */
	get transport() {
		return this.#logTransport;
	}

	/**
	 * Create a child logger with additional base log data.
	 *
	 * @public
	 * @param {LogData} baseLogData
	 *     The base log data to add.
	 * @returns {Logger}
	 *     Returns a new child logger.
	 */
	createChildLogger(baseLogData) {
		return new Logger({
			_transport: this.transport,
			baseLogData: Object.assign({}, this.#baseLogData, baseLogData),
			logLevel: this.#logLevel,
			transforms: this.#transforms
		});
	}

	/**
	 * Add additional log data to all subsequent log calls.
	 *
	 * @deprecated Please create a child logger with `createChildLogger` or use the `baseLogData` option.
	 * @public
	 * @param {LogData} extraLogData
	 *     The additional data to add to all logs from this logger.
	 * @returns {void}
	 */
	addContext(extraLogData) {
		this.#baseLogData = Object.assign({}, this.#baseLogData, extraLogData);
		if (!this.#deprecatedMethodTracker.includes('addContext')) {
			this.#deprecatedMethodTracker.push('addContext');
			this.transport.warn({
				event: 'LOGGER_METHOD_DEPRECATED',
				message: "The 'addContext' logger method is deprecated",
				deprecatedMethod: 'addContext'
			});
		}
	}

	/**
	 * Set the `context` property for all subsequent log calls.
	 *
	 * @deprecated Please create a child logger with `createChildLogger` or use the `baseLogData` option.
	 * @public
	 * @param {LogData} contextData
	 *     The additional data to add to all log `context` properties.
	 * @returns {void}
	 */
	setContext(contextData) {
		this.#baseLogData.context = contextData;
		if (!this.#deprecatedMethodTracker.includes('setContext')) {
			this.#deprecatedMethodTracker.push('setContext');
			this.transport.warn({
				event: 'LOGGER_METHOD_DEPRECATED',
				message: "The 'setContext' logger method is deprecated",
				deprecatedMethod: 'setContext'
			});
		}
	}

	/**
	 * Clear the `context` property for all subsequent log calls.
	 *
	 * @deprecated Please create a child logger with `createChildLogger` or use the `baseLogData` option.
	 * @public
	 * @returns {void}
	 */
	clearContext() {
		delete this.#baseLogData.context;
		if (!this.#deprecatedMethodTracker.includes('clearContext')) {
			this.#deprecatedMethodTracker.push('clearContext');
			this.transport.warn({
				event: 'LOGGER_METHOD_DEPRECATED',
				message: "The 'clearContext' logger method is deprecated",
				deprecatedMethod: 'clearContext'
			});
		}
	}

	/**
	 * Send a log.
	 *
	 * @public
	 * @param {LogLevel} level
	 *     The log level to output the log as.
	 * @param {...LogData} logData
	 *     The log data.
	 * @returns {void}
	 */
	log(level, ...logData) {
		try {
			const { logLevel, isDeprecated } = Logger.getLogLevelInfo(level);

			// Zip and sanitize the log data
			const sanitizedLogData = Logger.zipLogData(...logData, this.#baseLogData);
			if (!sanitizedLogData.message) {
				sanitizedLogData.message = null;
			}

			// Transform the log data
			let transformedLogData = clone(sanitizedLogData, {
				lossy: true
			});
			if (this.#transforms.length) {
				transformedLogData = this.#transforms.reduce(
					(logData, transform) => transform(logData),
					transformedLogData
				);
			}

			// Send the log
			this.transport[logLevel](transformedLogData);

			// If the log level is deprecated, then log a warning about that
			if (isDeprecated && !this.#deprecatedMethodTracker.includes(level)) {
				this.#deprecatedMethodTracker.push(level);
				this.transport.warn({
					event: 'LOG_LEVEL_DEPRECATED',
					message: `The '${level}' log level is deprecated`,
					deprecatedLevel: level,
					suggestedLevel: logLevel
				});
			}
		} catch (/** @type {any} */ error) {
			sendBackupLog({
				level: 'error',
				event: 'LOG_METHOD_FAILURE',
				message: `Failed to log at level '${level}'`,
				error: serializeError(error)
			});
		}
	}

	/**
	 * Send a log with a level of "data".
	 *
	 * @deprecated Please use a log level of "debug" instead.
	 * @public
	 * @param {...LogData} logData
	 *     The log data.
	 * @returns {void}
	 */
	data(...logData) {
		this.log('data', ...logData);
	}

	/**
	 * Send a log with a level of "debug".
	 *
	 * @public
	 * @param {...LogData} logData
	 *     The log data.
	 * @returns {void}
	 */
	debug(...logData) {
		this.log('debug', ...logData);
	}

	/**
	 * Send a log with a level of "error".
	 *
	 * @public
	 * @param {...LogData} logData
	 *     The log data.
	 * @returns {void}
	 */
	error(...logData) {
		this.log('error', ...logData);
	}

	/**
	 * Send a log with a level of "fatal".
	 *
	 * @public
	 * @param {...LogData} logData
	 *     The log data.
	 * @returns {void}
	 */
	fatal(...logData) {
		this.log('fatal', ...logData);
	}

	/**
	 * Send a log with a level of "info".
	 *
	 * @public
	 * @param {...LogData} logData
	 *     The log data.
	 * @returns {void}
	 */
	info(...logData) {
		this.log('info', ...logData);
	}

	/**
	 * Send a log with a level of "silly".
	 *
	 * @deprecated Please use a log level of "debug" instead.
	 * @public
	 * @param {...LogData} logData
	 *     The log data.
	 * @returns {void}
	 */
	silly(...logData) {
		this.log('silly', ...logData);
	}

	/**
	 * Send a log with a level of "verbose".
	 *
	 * @deprecated Please use a log level of "debug" instead.
	 * @public
	 * @param {...LogData} logData
	 *     The log data.
	 * @returns {void}
	 */
	verbose(...logData) {
		this.log('verbose', ...logData);
	}

	/**
	 * Send a log with a level of "warn".
	 *
	 * @public
	 * @param {...LogData} logData
	 *     The log data.
	 * @returns {void}
	 */
	warn(...logData) {
		this.log('warn', ...logData);
	}

	/**
	 * Flush any asynchronous logs in the queue when an async transport is used.
	 *
	 * @public
	 * @returns {void}
	 */
	flush() {
		if (this.transport.flush) {
			this.transport.flush();
		}
	}

	/**
	 * Get information on a given log level.
	 *
	 * @private
	 * @param {string} level
	 *     The log level to get information for.
	 * @returns {LogLevelInfo}
	 *     Returns information about the log level.
	 */
	static getLogLevelInfo(level) {
		return (
			logLevelToTransportMethodMap[level] ||
			logLevelToTransportMethodMap.default
		);
	}

	/**
	 * Combine multiple log data into a single zipped object.
	 *
	 * @private
	 * @param {...LogData} logData
	 *     The log data.
	 * @returns {Object<string, any>}
	 *     Returns a single zipped object containing all log data.
	 */
	static zipLogData(...logData) {
		// We reverse the log data to maintain compatibility with n-logger,
		// which always uses the _first_ instance of a property or message
		// rather than the last
		const reversedLogData = logData.reverse();
		return clone(
			reversedLogData.reduce((collect, item) => {
				if (typeof item === 'string') {
					return Object.assign(collect, { message: item });
				}
				if (item instanceof Error) {
					return Object.assign(collect, { error: serializeError(item) });
				}
				return Object.assign(collect, item);
			}, {}),
			{ lossy: true }
		);
	}
}

module.exports = Logger;

// @ts-ignore
module.exports.default = module.exports;
