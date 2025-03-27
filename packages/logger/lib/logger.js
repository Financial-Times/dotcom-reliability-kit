const pino = require('pino').default;
const serializeError = require('@dotcom-reliability-kit/serialize-error');
const clone = require('lodash.clonedeep');
const appInfo = require('@dotcom-reliability-kit/app-info');

/**
 * @import {
 *   BaseLogData,
 *   LogData,
 *   LoggerInterface,
 *   LoggerOptions,
 *   LogLevel,
 *   LogLevelInfo,
 *   LogSerializer,
 *   LogTransform,
 *   LogTransport,
 *   PrivateLoggerOptions
 * } from '../types/logger';
 */

/**
 * A map of log levels to the underlying log method that
 * should be called when a log of that level is sent, as
 * well as the deprecation status of the log level.
 *
 * @type {{[key: string]: LogLevelInfo}}
 */
const logLevelToTransportMethodMap = {
	data: { logLevel: 'debug', isDeprecated: true, isDefaulted: false },
	debug: { logLevel: 'debug', isDeprecated: false, isDefaulted: false },
	default: { logLevel: 'info', isDeprecated: false, isDefaulted: true },
	error: { logLevel: 'error', isDeprecated: false, isDefaulted: false },
	fatal: { logLevel: 'fatal', isDeprecated: false, isDefaulted: false },
	info: { logLevel: 'info', isDeprecated: false, isDefaulted: false },
	silly: { logLevel: 'debug', isDeprecated: true, isDefaulted: false },
	verbose: { logLevel: 'debug', isDeprecated: true, isDefaulted: false },
	warn: { logLevel: 'warn', isDeprecated: false, isDefaulted: false }
};

/**
 * A list of supported log levels.
 *
 * @type {string[]}
 */
const logLevels = Object.keys(logLevelToTransportMethodMap);

/**
 * Whether log prettification is available. This is based
 * on whether pino-pretty is installed in the application.
 *
 * @type {boolean}
 */
const prettificationAvailable = (() => {
	try {
		// We have to `require` here rather than `require.resolve`
		// which is less than ideal but otherwise this is actually
		// impossible to test with Jest. Both technically do the
		// same file system work though, and it's only done once
		// when the module first loads. It's also safe to ts-ignore
		// this one because it's never actually used directly.
		// @ts-ignore
		require('pino-pretty');
		return true;
	} catch (_) {
		return false;
	}
})();

/**
 * Whether log prettification is allowed. We never allow log
 * prettification if the `NODE_ENV` environment variable is
 * set to "production". We also disallow prettification if the
 * cloud provider is AWS, pino-pretty does not work well with
 * CloudWatch logs
 *
 * @type {boolean}
 */
const prettificationAllowed =
	!['production', 'prod', 'p'].includes(appInfo.environment.toLowerCase()) &&
	appInfo.cloudProvider !== 'aws';

/**
 * Class representing a logger.
 *
 * @implements {LoggerInterface}
 */
module.exports = class Logger {
	/**
	 * @type {LogLevel}
	 */
	#logLevel = 'debug';

	/**
	 * @type {BaseLogData}
	 */
	#baseLogData = {};

	/**
	 * @type {{[key: string]: LogSerializer}}
	 */
	#serializers = {};

	/**
	 * @type {string[]}
	 */
	#serializedProperties = [];

	/**
	 * @type {LogTransform[]}
	 */
	#transforms = [];

	/**
	 * @type {LogTransport}
	 */
	#logTransport;

	/**
	 * @type {string[]}
	 */
	#deprecatedMethodTracker = [];

	/**
	 * @type {string[]}
	 */
	#defaultedLogLevelTracker = [];

	/**
	 * Create a logger.
	 *
	 * @param {LoggerOptions & PrivateLoggerOptions} [options]
	 *     Options to configure the logger.
	 */
	constructor(options = {}) {
		// Default and set the base log data option
		if (options.baseLogData) {
			// TODO when we remove `setContext` and `clearContext` we can freeze this
			// object with `Object.freeze` to prevent any editing after instantiation
			this.#baseLogData = clone(options.baseLogData);
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

		// Default and set the serializers option
		if (options.serializers) {
			if (
				typeof options.serializers !== 'object' ||
				Array.isArray(options.serializers) ||
				options.serializers === null ||
				Object.values(options.serializers).some(
					(serializer) => typeof serializer !== 'function'
				)
			) {
				throw new TypeError(
					'The `serializers` option must be an object where each property value is a function'
				);
			}
			this.#serializers = clone(options.serializers);
		}

		// We disallow custom serializers for key logging properties that we want to be consistent
		delete this.#serializers.level;
		delete this.#serializers.message;
		delete this.#serializers.time;

		// We always set the error serializer - it's too important and making this configurable
		// complicates log zipping, we'd have to use the same custom serializer for when top-level
		// log data is an error instance
		this.#serializers.error = this.#serializers.err = (error) => {
			if (error instanceof Error) {
				return serializeError(error);
			}
			return error;
		};
		this.#serializedProperties = Object.keys(this.#serializers);

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

		// Default and set the prettifier option
		const withPrettifier =
			typeof options.withPrettifier === 'boolean'
				? options.withPrettifier
				: !Boolean(process.env.LOG_DISABLE_PRETTIFIER);

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
				timestamp: pino.stdTimeFunctions.isoTime
			};
			if (withPrettifier && prettificationAllowed && prettificationAvailable) {
				pinoOptions.transport = {
					target: 'pino-pretty',
					worker: { execArgv: [] },
					options: {
						colorize: true,
						messageKey: 'message'
					}
				};
			}
			this.#logTransport = pino(pinoOptions);
			this.#logTransport.level = this.#logLevel;
		}

		// Bind the log level methods so that they can be used without
		// the `this` context, e.g. as event handlers
		for (const logLevel of logLevels) {
			if (typeof this[logLevel] === 'function') {
				this[logLevel] = this[logLevel].bind(this);
			}
		}
	}

	get baseLogData() {
		return this.#baseLogData;
	}

	get logLevel() {
		return this.#logLevel;
	}

	get transport() {
		return this.#logTransport;
	}

	/**
	 * Create a child logger with additional base log data.
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
	 */
	log(level, ...logData) {
		if (typeof level !== 'string') {
			throw new TypeError('The log `level` argument must be a string');
		}
		try {
			const { logLevel, isDeprecated, isDefaulted } =
				Logger.getLogLevelInfo(level);

			if (isDefaulted && !this.#defaultedLogLevelTracker.includes(level)) {
				this.#defaultedLogLevelTracker.push(level);
				this.transport.warn(new Error('Invalid log level used'), {
					event: 'LOG_LEVEL_INVALID',
					message: `The '${level}' log level is invalid, defaulting to '${logLevel}'`,
					invalidLevel: level,
					defaultedLevel: logLevel
				});
			}

			// Zip and sanitize the log data
			const sanitizedLogData = Logger.zipLogData(...logData, this.#baseLogData);
			if (!sanitizedLogData.message) {
				sanitizedLogData.message = null;
			}

			// Serialize properties which have a custom serializer
			for (const key of this.#serializedProperties) {
				if (sanitizedLogData[key] !== undefined) {
					sanitizedLogData[key] = this.#serializers[key](
						sanitizedLogData[key],
						key
					);
				}
			}

			// Transform the log data
			let transformedLogData = clone(sanitizedLogData);
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
			// We allow use of `console.log` here to ensure that critical
			// logging failures are caught and logged. This ensures that we
			// know if an app has broken logging.
			// eslint-disable-next-line no-console
			console.log(
				JSON.stringify({
					level: 'error',
					event: 'LOG_METHOD_FAILURE',
					message: `Failed to log at level '${level}'`,
					error: serializeError(error)
				})
			);
		}
	}

	/**
	 * Send a log with a level of "data".
	 */
	data(...logData) {
		this.log('data', ...logData);
	}

	/**
	 * Send a log with a level of "debug".
	 */
	debug(...logData) {
		this.log('debug', ...logData);
	}

	/**
	 * Send a log with a level of "error".
	 */
	error(...logData) {
		this.log('error', ...logData);
	}

	/**
	 * Send a log with a level of "fatal".
	 */
	fatal(...logData) {
		this.log('fatal', ...logData);
	}

	/**
	 * Send a log with a level of "info".
	 */
	info(...logData) {
		this.log('info', ...logData);
	}

	/**
	 * Send a log with a level of "silly".
	 */
	silly(...logData) {
		this.log('silly', ...logData);
	}

	/**
	 * Send a log with a level of "verbose".
	 */
	verbose(...logData) {
		this.log('verbose', ...logData);
	}

	/**
	 * Send a log with a level of "warn".
	 */
	warn(...logData) {
		this.log('warn', ...logData);
	}

	/**
	 * Flush any asynchronous logs in the queue when an async transport is used.
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
	 * @returns {BaseLogData}
	 *     Returns a single zipped object containing all log data.
	 */
	static zipLogData(...logData) {
		// We reverse the log data to maintain compatibility with n-logger,
		// which always uses the _first_ instance of a property or message
		// rather than the last
		const reversedLogData = logData.reverse();
		return clone(
			reversedLogData.reduce(
				/**
				 * @param {BaseLogData} collect
				 * @param {LogData} item
				 * @returns {BaseLogData}
				 */
				(collect, item) => {
					if (typeof item === 'string') {
						return Object.assign(collect, { message: item });
					}
					if (item instanceof Error) {
						return Object.assign(collect, { error: serializeError(item) });
					}
					return Object.assign(collect, item);
				},
				{}
			)
		);
	}
};
