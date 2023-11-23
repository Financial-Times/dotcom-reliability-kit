jest.mock('pino', () => {
	const pinoDefault = jest.fn();

	pinoDefault.stdTimeFunctions = {
		isoTime: 'mockIsoTime'
	};

	return {
		default: pinoDefault,
		createMockPinoLogger() {
			return {
				flush: jest.fn(),
				mockCanonicalLevel: jest.fn(),
				mockDeprecatedCanonocalLevel: jest.fn(),
				mockErroringLevel: jest.fn().mockImplementation(() => {
					throw new Error('mock error');
				}),
				warn: jest.fn()
			};
		}
	};
});
const { default: pino, createMockPinoLogger } = require('pino');

jest.mock('pino-pretty', () => {
	throw new Error('mock error to simulate missing pino-pretty install');
});

jest.mock('@dotcom-reliability-kit/app-info', () => ({
	environment: 'production'
}));
const appInfo = require('@dotcom-reliability-kit/app-info');

jest.mock('@dotcom-reliability-kit/serialize-error', () => jest.fn());
const serializeError = require('@dotcom-reliability-kit/serialize-error');

// Set environment variables explicitly before importing the logger
delete process.env.LOG_LEVEL;
delete process.env.SPLUNK_LOG_LEVEL;

let Logger = require('../../../lib/logger');

describe('@dotcom-reliability-kit/logger/lib/logger', () => {
	let mockPinoLogger;
	let pinoPretty;

	beforeEach(() => {
		mockPinoLogger = createMockPinoLogger();
		pino.mockReturnValue(mockPinoLogger);
	});

	afterEach(() => {
		jest.restoreAllMocks();
	});

	it('exports a class', () => {
		expect(Logger).toBeInstanceOf(Function);
		expect(() => {
			Logger();
		}).toThrow(/class constructor/i);
	});

	describe('new Logger(options)', () => {
		let logger;

		beforeEach(() => {
			logger = new Logger();
		});

		it('creates a Pino logger', () => {
			expect(pino).toBeCalledTimes(1);
		});

		it('configures the created Pino logger with no prettifier', () => {
			const pinoOptions = pino.mock.calls[0][0];
			expect(typeof pinoOptions).toStrictEqual('object');
			expect(pinoOptions.base).toEqual({});
			expect(pinoOptions.messageKey).toStrictEqual('message');
			expect(pinoOptions.timestamp).toStrictEqual(true);

			expect(typeof pinoOptions.formatters).toStrictEqual('object');
			expect(typeof pinoOptions.formatters.level).toStrictEqual('function');
			expect(pinoOptions.formatters.level('mock-level')).toEqual({
				level: 'mock-level'
			});

			expect(pinoOptions.transport).toBeUndefined();
		});

		it('sets the Pino logger level to "debug"', () => {
			expect(mockPinoLogger.level).toStrictEqual('debug');
		});

		describe('.baseLogData', () => {
			it('is set to an empty object', () => {
				expect(logger.baseLogData).toEqual({});
			});
		});

		describe('.logLevel', () => {
			it('is set to "debug"', () => {
				expect(logger.logLevel).toEqual('debug');
			});
		});

		describe('.transport', () => {
			it('is set to the created Pino logger', () => {
				expect(logger.transport).toStrictEqual(mockPinoLogger);
			});
		});

		describe('.createChildLogger(baseLogData)', () => {
			let childLogger;

			beforeEach(() => {
				jest.spyOn(Logger, 'getLogLevelInfo');
				logger = new Logger({
					baseLogData: {
						isMockParentBaseData: true,
						isMockChildBaseData: false
					},
					logLevel: 'mock parent level',
					_transport: 'mock parent transport'
				});
				childLogger = logger.createChildLogger({
					isMockChildBaseData: true
				});
			});

			it('returns a new child logger with mixed in base log data', () => {
				expect(childLogger).toBeInstanceOf(Logger);
				expect(childLogger === logger).toBeFalsy();
				expect(Logger.getLogLevelInfo).toBeCalledWith('mock parent level');
				expect(childLogger.transport).toStrictEqual('mock parent transport');
				expect(childLogger.baseLogData).toEqual({
					isMockParentBaseData: true,
					isMockChildBaseData: true
				});
			});
		});

		describe('.addContext(additionalLogData)', () => {
			beforeEach(() => {
				mockPinoLogger.warn.mockClear();
				logger = new Logger({
					baseLogData: {
						isExistingBaseLogData: true,
						isNewBaseLogData: false,
						mockProperty: 1
					}
				});
				logger.addContext({
					isNewBaseLogData: true,
					mockProperty: 2
				});
			});

			it('merges the additional data into the `baseLogData` property', () => {
				expect(logger.baseLogData).toEqual({
					isExistingBaseLogData: true,
					isNewBaseLogData: true,
					mockProperty: 2
				});
			});

			it('logs a deprecation warning', () => {
				expect(mockPinoLogger.warn).toBeCalledTimes(1);
				expect(mockPinoLogger.warn).toBeCalledWith({
					event: 'LOGGER_METHOD_DEPRECATED',
					message: "The 'addContext' logger method is deprecated",
					deprecatedMethod: 'addContext'
				});
			});

			describe('when called a second time', () => {
				beforeEach(() => {
					logger.addContext({});
				});

				it('does not log a second deprecation warning', () => {
					expect(mockPinoLogger.warn).toBeCalledTimes(1);
				});
			});
		});

		describe('.setContext(contextData)', () => {
			beforeEach(() => {
				mockPinoLogger.warn.mockClear();
				logger = new Logger({
					baseLogData: {
						isBaseLogData: true,
						context: {
							isBaseLogContextData: true,
							mockProperty: 1
						}
					}
				});
				logger.setContext({
					isContextData: true,
					mockProperty: 2
				});
			});

			it('sets the `baseLogData.context` property', () => {
				expect(logger.baseLogData.context).toEqual({
					isContextData: true,
					mockProperty: 2
				});
			});

			it('does not modify other `baseLogData` properties', () => {
				expect(logger.baseLogData.isBaseLogData).toStrictEqual(true);
			});

			it('logs a deprecation warning', () => {
				expect(mockPinoLogger.warn).toBeCalledTimes(1);
				expect(mockPinoLogger.warn).toBeCalledWith({
					event: 'LOGGER_METHOD_DEPRECATED',
					message: "The 'setContext' logger method is deprecated",
					deprecatedMethod: 'setContext'
				});
			});

			describe('when called a second time', () => {
				beforeEach(() => {
					logger.setContext({});
				});

				it('does not log a second deprecation warning', () => {
					expect(mockPinoLogger.warn).toBeCalledTimes(1);
				});
			});
		});

		describe('.clearContext(contextData)', () => {
			beforeEach(() => {
				mockPinoLogger.warn.mockClear();
				logger = new Logger({
					baseLogData: {
						isBaseLogData: true,
						context: {
							isBaseLogContextData: true,
							mockProperty: 1
						}
					}
				});
				logger.clearContext();
			});

			it('sets the `baseLogData.context` property to `undefined`', () => {
				expect(logger.baseLogData.context).toBeUndefined();
			});

			it('does not modify other `baseLogData` properties', () => {
				expect(logger.baseLogData.isBaseLogData).toStrictEqual(true);
			});

			it('logs a deprecation warning', () => {
				expect(mockPinoLogger.warn).toBeCalledTimes(1);
				expect(mockPinoLogger.warn).toBeCalledWith({
					event: 'LOGGER_METHOD_DEPRECATED',
					message: "The 'clearContext' logger method is deprecated",
					deprecatedMethod: 'clearContext'
				});
			});

			describe('when called a second time', () => {
				beforeEach(() => {
					logger.clearContext({});
				});

				it('does not log a second deprecation warning', () => {
					expect(mockPinoLogger.warn).toBeCalledTimes(1);
				});
			});
		});

		describe('.log(level, ...logData)', () => {
			beforeEach(() => {
				logger = new Logger({
					baseLogData: {
						mockBaseData: true
					}
				});
				mockPinoLogger.mockCanonicalLevel.mockClear();
				mockPinoLogger.warn.mockClear();
				jest.spyOn(Logger, 'getLogLevelInfo').mockReturnValue({
					logLevel: 'mockCanonicalLevel',
					isDeprecated: false
				});
				jest.spyOn(Logger, 'zipLogData').mockReturnValue({
					isMockZippedData: true,
					message: 'mock zipped message'
				});
				logger.log('mockLevel', 'mock message', { mockData: true });
			});

			it('gets the log level information', () => {
				expect(Logger.getLogLevelInfo).toBeCalledTimes(1);
				expect(Logger.getLogLevelInfo).toBeCalledWith('mockLevel');
			});

			it('zips all the log data alongside the logger `baseLogData` property', () => {
				expect(Logger.zipLogData).toBeCalledTimes(1);
				expect(Logger.zipLogData).toBeCalledWith(
					'mock message',
					{
						mockData: true
					},
					{
						mockBaseData: true
					}
				);
			});

			it('calls the relevant log transport method for the level', () => {
				expect(mockPinoLogger.mockCanonicalLevel).toBeCalledTimes(1);
				expect(mockPinoLogger.mockCanonicalLevel).toBeCalledWith({
					isMockZippedData: true,
					message: 'mock zipped message'
				});
			});

			it('does not log a warning', () => {
				expect(mockPinoLogger.warn).toBeCalledTimes(0);
			});

			describe('when the log data does not include a message', () => {
				beforeEach(() => {
					mockPinoLogger.mockCanonicalLevel.mockClear();
					jest.spyOn(Logger, 'zipLogData').mockReturnValue({
						isMockZippedData: true
					});
					logger.log('mockLevel', 'mock message', { mockData: true });
				});

				it('calls the relevant log transport method with a null message property', () => {
					expect(mockPinoLogger.mockCanonicalLevel).toBeCalledTimes(1);
					expect(mockPinoLogger.mockCanonicalLevel).toBeCalledWith({
						isMockZippedData: true,
						message: null
					});
				});
			});

			describe('when the log data has an error property as a sub-property', () => {
				beforeEach(() => {
					mockPinoLogger.mockCanonicalLevel.mockClear();
					jest.spyOn(Logger, 'zipLogData').mockReturnValue({
						error: new Error('mock error'),
						isMockZippedData: true
					});
					serializeError.mockClear();
					serializeError.mockReturnValueOnce('mock serialized error');
					logger.log('mockLevel', 'mock message', { mockData: true });
				});

				it('serializes the contents of the error sub-property', () => {
					expect(serializeError).toBeCalledTimes(1);
					expect(serializeError).toBeCalledWith(new Error('mock error'));
				});

				it('calls the relevant log transport method with an error sub-property which is set to the serialized error', () => {
					expect(mockPinoLogger.mockCanonicalLevel).toBeCalledTimes(1);
					expect(mockPinoLogger.mockCanonicalLevel).toBeCalledWith({
						isMockZippedData: true,
						message: null,
						error: 'mock serialized error'
					});
				});
			});

			describe('when the log data has an err property as a sub-property', () => {
				beforeEach(() => {
					mockPinoLogger.mockCanonicalLevel.mockClear();
					jest.spyOn(Logger, 'zipLogData').mockReturnValue({
						err: new Error('mock error'),
						isMockZippedData: true
					});
					serializeError.mockClear();
					serializeError.mockReturnValueOnce('mock serialized error');
					logger.log('mockLevel', 'mock message', { mockData: true });
				});

				it('serializes the contents of the err sub-property', () => {
					expect(serializeError).toBeCalledTimes(1);
					expect(serializeError).toBeCalledWith(new Error('mock error'));
				});

				it('calls the relevant log transport method with an err sub-property which is set to the serialized error', () => {
					expect(mockPinoLogger.mockCanonicalLevel).toBeCalledTimes(1);
					expect(mockPinoLogger.mockCanonicalLevel).toBeCalledWith({
						isMockZippedData: true,
						message: null,
						err: 'mock serialized error'
					});
				});
			});

			describe('when the given level is deprecated', () => {
				beforeEach(() => {
					mockPinoLogger.mockDeprecatedCanonocalLevel.mockClear();
					mockPinoLogger.warn.mockClear();
					Logger.getLogLevelInfo.mockReturnValue({
						logLevel: 'mockDeprecatedCanonocalLevel',
						isDeprecated: true
					});
					logger.log('mockDeprecatedLevel', 'mock message', { mockData: true });
				});

				it('calls the relevant log transport method for the level', () => {
					expect(mockPinoLogger.mockDeprecatedCanonocalLevel).toBeCalledTimes(
						1
					);
					expect(mockPinoLogger.mockDeprecatedCanonocalLevel).toBeCalledWith({
						isMockZippedData: true,
						message: 'mock zipped message'
					});
				});

				it('logs a deprecation warning', () => {
					expect(mockPinoLogger.warn).toBeCalledTimes(1);
					expect(mockPinoLogger.warn).toBeCalledWith({
						event: 'LOG_LEVEL_DEPRECATED',
						message: "The 'mockDeprecatedLevel' log level is deprecated",
						deprecatedLevel: 'mockDeprecatedLevel',
						suggestedLevel: 'mockDeprecatedCanonocalLevel'
					});
				});

				describe('when a deprecated log level is used a second time', () => {
					beforeEach(() => {
						logger.log('mockDeprecatedLevel', 'mock message', {
							mockData: true
						});
					});

					it('does not log a second deprecation warning', () => {
						expect(mockPinoLogger.warn).toBeCalledTimes(1);
					});
				});
			});

			describe('when an error occurs during logging', () => {
				beforeEach(() => {
					serializeError.mockClear();
					serializeError.mockReturnValue({
						isMockSerializedError: true
					});
					jest.spyOn(console, 'log').mockImplementation(() => {});
					Logger.getLogLevelInfo.mockReturnValue({
						logLevel: 'mockErroringLevel',
						isDeprecated: true
					});
					logger.log('mockErroringLevel', 'mock message', { mockData: true });
				});

				it('logs the error information as JSON using `console.log`', () => {
					// eslint-disable-next-line no-console
					expect(console.log).toBeCalledTimes(1);
					// eslint-disable-next-line no-console
					expect(console.log).toBeCalledWith(
						JSON.stringify({
							level: 'error',
							event: 'LOG_METHOD_FAILURE',
							message: "Failed to log at level 'mockErroringLevel'",
							error: {
								isMockSerializedError: true
							}
						})
					);
				});
			});

			describe('when `level` is not a string', () => {
				it('throws a type error', () => {
					expect(() => logger.log({})).toThrow(
						new TypeError('The log `level` argument must be a string')
					);
				});
			});
		});

		const logMethods = [
			'data',
			'debug',
			'error',
			'fatal',
			'info',
			'silly',
			'verbose',
			'warn'
		];
		for (const levelMethod of logMethods) {
			// eslint-disable-next-line no-loop-func
			describe(`.${levelMethod}(...logData)`, () => {
				beforeEach(() => {
					logger.log = jest.fn();
					logger[levelMethod]('mock message', { mockData: true });
				});

				it(`calls .log() with a level of '${levelMethod}'`, () => {
					expect(logger.log).toBeCalledTimes(1);
				});

				describe(`when the method is detatched from the logger instance`, () => {
					beforeEach(() => {
						logger.log.mockReset();
						const detatchedLogMethod = logger[levelMethod];
						detatchedLogMethod('mock message', { mockData: true });
					});

					it(`calls .log() with a level of '${levelMethod}'`, () => {
						expect(logger.log).toBeCalledTimes(1);
					});
				});
			});
		}

		describe('.flush()', () => {
			beforeEach(() => {
				logger.flush();
			});

			it('calls the `flush` method of the log transport', () => {
				expect(mockPinoLogger.flush).toBeCalledTimes(1);
				expect(mockPinoLogger.flush).toBeCalledWith();
			});

			describe('when the log transport has no `flush` method', () => {
				beforeEach(() => {
					logger = new Logger({
						_transport: {}
					});
					mockPinoLogger.flush = jest.fn();
					logger.flush();
				});

				it('does nothing', () => {
					expect(mockPinoLogger.flush).toBeCalledTimes(0);
				});
			});
		});

		describe('when the `baseLogData` option is set', () => {
			let baseLogData;

			beforeEach(() => {
				baseLogData = {
					isMockBaseData: true,
					mockSubObject: { isMockSubObject: true }
				};
				logger = new Logger({
					baseLogData
				});
			});

			describe('.baseLogData', () => {
				it('is set to the value of the `baseLogData` option', () => {
					expect(logger.baseLogData).toEqual({
						isMockBaseData: true,
						mockSubObject: { isMockSubObject: true }
					});
				});

				it('is a deep cloned copy of the original option', () => {
					baseLogData.a = 1;
					baseLogData.mockSubObject.a = 1;
					expect(logger.baseLogData.a).toBeUndefined();
					expect(logger.baseLogData.mockSubObject.a).toBeUndefined();
				});
			});
		});

		describe('when a `transforms` option is set', () => {
			let mockTransforms;

			beforeEach(() => {
				jest.spyOn(Logger, 'getLogLevelInfo').mockReturnValue({
					logLevel: 'mockCanonicalLevel',
					isDeprecated: false
				});
				jest.spyOn(Logger, 'zipLogData').mockReturnValue({
					isMockZippedData: true,
					message: 'mock zipped message'
				});
				mockPinoLogger.mockCanonicalLevel.mockClear();
				mockTransforms = [jest.fn(() => ({ isTransformedLogData: true }))];
				logger = new Logger({
					transforms: mockTransforms
				});
			});

			describe('.log(level, ...logData)', () => {
				beforeEach(() => {
					logger.log('mockLevel', 'mock message', { mockData: true });
				});

				it('calls the log transform with the zipped log data', () => {
					expect(mockTransforms[0]).toBeCalledTimes(1);
					expect(mockTransforms[0]).toBeCalledWith({
						isMockZippedData: true,
						message: 'mock zipped message'
					});
				});

				it('calls the relevant log transport method with the transformed log data', () => {
					expect(mockPinoLogger.mockCanonicalLevel).toBeCalledTimes(1);
					expect(mockPinoLogger.mockCanonicalLevel).toBeCalledWith({
						isTransformedLogData: true
					});
				});
			});

			describe('when multiple transforms are used', () => {
				beforeEach(() => {
					mockPinoLogger.mockCanonicalLevel.mockClear();
					mockTransforms = [
						...mockTransforms,
						jest.fn(() => ({ isSecondTransformedLogData: true }))
					];
					logger = new Logger({
						transforms: mockTransforms
					});
				});

				describe('.log(level, ...logData)', () => {
					beforeEach(() => {
						logger.log('mockLevel', 'mock message', { mockData: true });
					});

					it('calls each of the log transform with the log data, passing the result of each transform onto the next', () => {
						expect(mockTransforms[0]).toBeCalledTimes(1);
						expect(mockTransforms[0]).toBeCalledWith({
							isMockZippedData: true,
							message: 'mock zipped message'
						});
						expect(mockTransforms[1]).toBeCalledTimes(1);
						expect(mockTransforms[1]).toBeCalledWith({
							isTransformedLogData: true
						});
					});

					it('calls the relevant log transport method with the final transformed log data', () => {
						expect(mockPinoLogger.mockCanonicalLevel).toBeCalledTimes(1);
						expect(mockPinoLogger.mockCanonicalLevel).toBeCalledWith({
							isSecondTransformedLogData: true
						});
					});
				});
			});

			describe('when the transforms option is not an array', () => {
				it('throws a type error', () => {
					expect(() => {
						logger = new Logger({
							transforms: {}
						});
					}).toThrowError(
						new TypeError(
							'The `transforms` option must be an array of functions'
						)
					);
				});
			});

			describe('when one of the transforms is not a function', () => {
				it('throws a type error', () => {
					expect(() => {
						logger = new Logger({
							transforms: [() => {}, 'nope']
						});
					}).toThrowError(
						new TypeError(
							'The `transforms` option must be an array of functions'
						)
					);
				});
			});
		});

		describe('when a `transport` option is set', () => {
			beforeEach(() => {
				pino.mockClear();
				logger = new Logger({
					_transport: 'mock transport'
				});
			});

			it('does not create a Pino logger', () => {
				expect(pino).toBeCalledTimes(0);
			});

			describe('.transport', () => {
				it('is set to the value of the `transport` option', () => {
					expect(logger.transport).toStrictEqual('mock transport');
				});
			});
		});

		describe('when the `withTimestamps` option is set to `false`', () => {
			beforeEach(() => {
				pino.mockReset();
				pino.mockReturnValue(mockPinoLogger);
				logger = new Logger({
					withTimestamps: false
				});
			});

			it('turns off timestamps in the created Pino logger', () => {
				const pinoOptions = pino.mock.calls[0][0];
				expect(pinoOptions.timestamp).toStrictEqual(false);
			});
		});

		describe('when the `useIsoTimeFormat` option is set to `true`', () => {
			beforeEach(() => {
				pino.mockReset();
				pino.mockReturnValue(mockPinoLogger);
				logger = new Logger({
					useIsoTimeFormat: true
				});
			});

			it('formats timestamps in the Pino logger as ISO8601', () => {
				const pinoOptions = pino.mock.calls[0][0];
				expect(pinoOptions.timestamp).toStrictEqual('mockIsoTime');
			});
		});

		describe('when the `logLevel` option is set', () => {
			beforeEach(() => {
				process.env.LOG_LEVEL = 'mockEnvLogLevel';
				process.env.SPLUNK_LOG_LEVEL = 'mockEnvSplunkLogLevel';
				jest.spyOn(Logger, 'getLogLevelInfo').mockReturnValue({
					logLevel: 'mockCanonicalLevel'
				});
				logger = new Logger({
					logLevel: 'mockLevel'
				});
			});

			it('gets the log level information', () => {
				expect(Logger.getLogLevelInfo).toBeCalledTimes(1);
				expect(Logger.getLogLevelInfo).toBeCalledWith('mockLevel');
			});

			it('sets the Pino logger level to the `logLevel` of the log level information', () => {
				expect(mockPinoLogger.level).toStrictEqual('mockCanonicalLevel');
			});

			describe('.logLevel', () => {
				it('is set to the `logLevel` of the log level information', () => {
					expect(logger.logLevel).toStrictEqual('mockCanonicalLevel');
				});
			});
		});

		describe('when a `LOG_LEVEL` environment variable is set', () => {
			beforeEach(() => {
				process.env.LOG_LEVEL = 'mockEnvLogLevel';
				process.env.SPLUNK_LOG_LEVEL = 'mockEnvSplunkLogLevel';
				jest.spyOn(Logger, 'getLogLevelInfo').mockReturnValue({
					logLevel: 'mockCanonicalLevel'
				});
				logger = new Logger();
			});

			it('gets the log level information based on the environment variable', () => {
				expect(Logger.getLogLevelInfo).toBeCalledTimes(1);
				expect(Logger.getLogLevelInfo).toBeCalledWith('mockEnvLogLevel');
			});
		});

		describe('when a `SPLUNK_LOG_LEVEL` environment variable is set', () => {
			beforeEach(() => {
				delete process.env.LOG_LEVEL;
				process.env.SPLUNK_LOG_LEVEL = 'mockEnvSplunkLogLevel';
				jest.spyOn(Logger, 'getLogLevelInfo').mockReturnValue({
					logLevel: 'mockCanonicalLevel'
				});
				logger = new Logger();
			});

			it('gets the log level information based on the environment variable', () => {
				expect(Logger.getLogLevelInfo).toBeCalledTimes(1);
				expect(Logger.getLogLevelInfo).toBeCalledWith('mockEnvSplunkLogLevel');
			});
		});

		describe('when pino-pretty is installed and the environment is not "production" - e.g. "development', () => {
			beforeEach(() => {
				jest.mock('pino-pretty', () => {
					return { default: jest.fn().mockReturnValue('mock pino pretty') };
				});
				pinoPretty = require('pino-pretty').default;
				appInfo.environment = 'development';

				// We have to reset all modules because the checks for pino-pretty are done
				// on module load for performance reasons. This resets the cache and reloads
				// everything with a new environment.
				jest.isolateModules(() => {
					Logger = require('../../../lib/logger');
				});

				pino.mockClear();
				logger = new Logger();
			});

			afterEach(() => {
				jest.unmock('pino-pretty');
			});

			it('configures the created Pino logger with prettification', () => {
				const pinoStream = pino.mock.calls[0][1];
				expect(pinoPretty).toHaveBeenCalledWith({
					colorize: true,
					messageKey: 'message'
				});
				expect(pinoStream).toStrictEqual('mock pino pretty');
			});
		});

		describe('when pino-pretty is installed and the environment is not "production" - e.g. "test', () => {
			beforeEach(() => {
				jest.mock('pino-pretty', () => {
					return { default: jest.fn().mockReturnValue('mock pino pretty') };
				});
				pinoPretty = require('pino-pretty').default;
				appInfo.environment = 'test';

				// We have to reset all modules because the checks for pino-pretty are done
				// on module load for performance reasons. This resets the cache and reloads
				// everything with a new environment.
				jest.isolateModules(() => {
					Logger = require('../../../lib/logger');
				});

				pino.mockClear();
				logger = new Logger();
			});

			afterEach(() => {
				jest.unmock('pino-pretty');
			});

			it('configures the created Pino logger with prettification', () => {
				const pinoStream = pino.mock.calls[0][1];
				expect(pinoPretty).toHaveBeenCalledWith({
					colorize: true,
					messageKey: 'message'
				});
				expect(pinoStream).toStrictEqual('mock pino pretty');
			});
		});

		describe('when pino-pretty is installed and the `withPrettifier` option is set to `false`', () => {
			beforeEach(() => {
				jest.mock('pino-pretty', () => {
					return { default: jest.fn().mockReturnValue('mock pino pretty') };
				});
				pinoPretty = require('pino-pretty').default;
				appInfo.environment = 'development';

				// We have to reset all modules because the checks for pino-pretty are done
				// on module load for performance reasons. This resets the cache and reloads
				// everything with a new environment.
				jest.isolateModules(() => {
					Logger = require('../../../lib/logger');
				});

				pino.mockClear();
				logger = new Logger({ withPrettifier: false });
			});

			afterEach(() => {
				jest.unmock('pino-pretty');
			});

			it('does not configure the created Pino logger with prettification', () => {
				const pinoOptions = pino.mock.calls[0][0];
				expect(pinoOptions.transport).toBeUndefined();
			});
		});

		describe('when pino-pretty is installed and the `LOG_DISABLE_PRETTIFIER` environment variable is set', () => {
			beforeEach(() => {
				jest.mock('pino-pretty', () => {
					return { default: jest.fn().mockReturnValue('mock pino pretty') };
				});
				pinoPretty = require('pino-pretty').default;
				appInfo.environment = 'development';
				process.env.LOG_DISABLE_PRETTIFIER = 'true';

				// We have to reset all modules because the checks for pino-pretty are done
				// on module load for performance reasons. This resets the cache and reloads
				// everything with a new environment.
				jest.isolateModules(() => {
					Logger = require('../../../lib/logger');
				});

				pino.mockClear();
				logger = new Logger();
			});

			afterEach(() => {
				jest.unmock('pino-pretty');
			});

			it('does not configure the created Pino logger with prettification', () => {
				const pinoOptions = pino.mock.calls[0][0];
				expect(pinoOptions.transport).toBeUndefined();
			});
		});

		describe('when pino-pretty is installed and the environment is "production"', () => {
			beforeEach(() => {
				jest.mock('pino-pretty', () => {
					return { default: jest.fn().mockReturnValue('mock pino pretty') };
				});
				pinoPretty = require('pino-pretty').default;
				appInfo.environment = 'production';

				// We have to reset all modules because the checks for pino-pretty are done
				// on module load for performance reasons. This resets the cache and reloads
				// everything with a new environment.
				jest.isolateModules(() => {
					Logger = require('../../../lib/logger');
				});

				pino.mockClear();
				logger = new Logger();
			});

			afterEach(() => {
				jest.unmock('pino-pretty');
			});

			it('does not configure the created Pino logger with prettification', () => {
				const pinoOptions = pino.mock.calls[0][0];
				expect(pinoOptions.transport).toBeUndefined();
			});
		});

		describe('when pino-pretty is not installed and the environment is "development"', () => {
			beforeEach(() => {
				appInfo.environment = 'development';

				// We have to reset all modules because the checks for pino-pretty are done
				// on module load for performance reasons. This resets the cache and reloads
				// everything with a new environment.
				jest.isolateModules(() => {
					Logger = require('../../../lib/logger');
				});

				pino.mockClear();
				logger = new Logger();
			});

			it('configures the created Pino logger without prettification', () => {
				const pinoOptions = pino.mock.calls[0][0];
				expect(pinoOptions.transport).toBeUndefined();
			});
		});
	});

	describe('Logger.getLogLevelInfo(level)', () => {
		describe('when `level` is "data"', () => {
			it('returns the expected log level information', () => {
				expect(Logger.getLogLevelInfo('data')).toEqual({
					logLevel: 'debug',
					isDeprecated: true
				});
			});
		});

		describe('when `level` is "debug"', () => {
			it('returns the expected log level information', () => {
				expect(Logger.getLogLevelInfo('debug')).toEqual({
					logLevel: 'debug',
					isDeprecated: false
				});
			});
		});

		describe('when `level` is "error"', () => {
			it('returns the expected log level information', () => {
				expect(Logger.getLogLevelInfo('error')).toEqual({
					logLevel: 'error',
					isDeprecated: false
				});
			});
		});

		describe('when `level` is "fatal"', () => {
			it('returns the expected log level information', () => {
				expect(Logger.getLogLevelInfo('fatal')).toEqual({
					logLevel: 'fatal',
					isDeprecated: false
				});
			});
		});

		describe('when `level` is "info"', () => {
			it('returns the expected log level information', () => {
				expect(Logger.getLogLevelInfo('info')).toEqual({
					logLevel: 'info',
					isDeprecated: false
				});
			});
		});

		describe('when `level` is "silly"', () => {
			it('returns the expected log level information', () => {
				expect(Logger.getLogLevelInfo('silly')).toEqual({
					logLevel: 'debug',
					isDeprecated: true
				});
			});
		});

		describe('when `level` is "verbose"', () => {
			it('returns the expected log level information', () => {
				expect(Logger.getLogLevelInfo('verbose')).toEqual({
					logLevel: 'debug',
					isDeprecated: true
				});
			});
		});

		describe('when `level` is "warn"', () => {
			it('returns the expected log level information', () => {
				expect(Logger.getLogLevelInfo('warn')).toEqual({
					logLevel: 'warn',
					isDeprecated: false
				});
			});
		});

		describe('when `level` is invalid', () => {
			it('returns default log level information', () => {
				expect(Logger.getLogLevelInfo('unknown')).toEqual({
					logLevel: 'info',
					isDeprecated: true
				});
			});
		});
	});

	describe('Logger.zipLogData(...logData)', () => {
		it('zips multiple log data items into a single object', () => {
			expect(Logger.zipLogData({ a: 1 }, { b: 2 }, { c: 3 })).toEqual({
				a: 1,
				b: 2,
				c: 3
			});
		});

		it('returns a deep cloned copy of the resulting object', () => {
			const object1 = { a: 1, sub: { a: true } };
			const object2 = { b: 2, sub: { b: true } };
			const zip = Logger.zipLogData(object1, object2);
			expect(zip).not.toStrictEqual(object1);
			expect(zip).not.toStrictEqual(object2);
			expect(object1.b).toBeUndefined();
			expect(object2.a).toBeUndefined();
			object1.newProperty = true;
			object1.sub.newProperty = true;
			object2.newProperty = true;
			object2.sub.newProperty = true;
			expect(zip.newProperty).toBeUndefined();
			expect(zip.sub.newProperty).toBeUndefined();
		});

		describe('when there are property conflicts between objects', () => {
			it('prioritizes the first instance of that property', () => {
				expect(Logger.zipLogData({ a: 1 }, { a: 2 }, { a: 3 })).toEqual({
					a: 1
				});
			});
		});

		describe('when an object has an Error instance as a property', () => {
			it('does not have additional error information wiped', () => {
				class MockError extends Error {
					name = 'MockError';
					constructor(message) {
						super(message);
						this.code = 'MOCK_ERROR';
					}
				}
				const mockError = new MockError('mock error');
				expect(Logger.zipLogData({ error: mockError })).toEqual({
					error: mockError
				});
				expect(Logger.zipLogData({ error: mockError }).error).toBeInstanceOf(
					MockError
				);
				expect(Logger.zipLogData({ error: mockError }).error.name).toEqual(
					'MockError'
				);
				expect(Logger.zipLogData({ error: mockError }).error.code).toEqual(
					'MOCK_ERROR'
				);
			});
		});

		describe('when one of the log data items is a string', () => {
			it('adds it as a `message` property', () => {
				expect(Logger.zipLogData('mock message', { a: 1 })).toEqual({
					message: 'mock message',
					a: 1
				});
			});

			describe('when there are multiple strings', () => {
				it('prioritizes the first', () => {
					expect(Logger.zipLogData('message 1', 'message 2')).toEqual({
						message: 'message 1'
					});
				});
			});
		});

		describe('when one of the log data items is an error object', () => {
			it('serializes it and adds it as an `error` property', () => {
				serializeError.mockClear();
				serializeError.mockReturnValueOnce('mock serialized error');
				const error = new Error('mock error');

				expect(Logger.zipLogData(error)).toEqual({
					error: 'mock serialized error'
				});
				expect(serializeError).toBeCalledTimes(1);
				expect(serializeError).toBeCalledWith(error);
			});

			describe('when there are multiple errors', () => {
				it('prioritizes the first', () => {
					serializeError.mockImplementation((error) => {
						return `mock serialized ${error.message}`;
					});
					const error1 = new Error('error 1');
					const error2 = new Error('error 2');
					expect(Logger.zipLogData(error1, error2)).toEqual({
						error: 'mock serialized error 1'
					});
				});
			});
		});

		describe('when a mix of data types is used', () => {
			it('correctly zips all of them', () => {
				serializeError.mockReturnValueOnce('mock serialized error');
				const error = new Error('mock error');

				expect(
					Logger.zipLogData('mock message', error, { a: 1 }, { b: 2 })
				).toEqual({
					message: 'mock message',
					error: 'mock serialized error',
					a: 1,
					b: 2
				});
			});
		});
	});

	describe('.default', () => {
		it('aliases the module exports', () => {
			expect(Logger.default).toStrictEqual(Logger);
		});
	});
});
