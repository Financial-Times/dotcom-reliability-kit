const { afterEach, beforeEach, describe, it, mock } = require('node:test');
const assert = require('node:assert/strict');

const pino = mock.fn();
pino.stdTimeFunctions = { isoTime: 'mockIsoTime' };
pino.createMockPinoLogger = () => ({
	flush: mock.fn(),
	mockCanonicalLevel: mock.fn(),
	mockDeprecatedCanonocalLevel: mock.fn(),
	mockInvalidCanonicalLevel: mock.fn(),
	mockErroringLevel: mock.fn(() => {
		throw new Error('mock error');
	}),
	warn: mock.fn()
});
mock.module('pino', { defaultExport: pino });

// An undefined export is used to simulate pino-pretty not being installed
mock.module('pino-pretty', { defaultExport: undefined });

mock.module('@dotcom-reliability-kit/app-info', {
	defaultExport: {
		cloudProvider: null,
		environment: 'production'
	}
});

mock.module('@dotcom-reliability-kit/serialize-error', {
	defaultExport: mock.fn(() => ({
		isMockSerializedError: true
	}))
});
const serializeError = require('@dotcom-reliability-kit/serialize-error');

// Set environment variables explicitly before importing the logger
delete process.env.LOG_LEVEL;
delete process.env.SPLUNK_LOG_LEVEL;

const Logger = require('../../../lib/logger.js');

describe('@dotcom-reliability-kit/logger/lib/logger', () => {
	let mockPinoLogger;

	beforeEach(() => {
		mockPinoLogger = pino.createMockPinoLogger();
		pino.mock.mockImplementation(() => mockPinoLogger);
	});

	afterEach(() => {
		mock.restoreAll();
	});

	it('exports a class', () => {
		assert.ok(Logger instanceof Function);
		assert.throws(() => Logger(), /class constructor/i);
	});

	describe('new Logger(options)', () => {
		let logger;

		beforeEach(() => {
			logger = new Logger();
		});

		it('creates a Pino logger', () => {
			assert.strictEqual(pino.mock.callCount(), 1);
		});

		it('configures the created Pino logger with no prettifier', () => {
			const pinoOptions = pino.mock.calls[0].arguments[0];
			assert.strictEqual(typeof pinoOptions, 'object');
			assert.deepStrictEqual(pinoOptions.base, {});
			assert.strictEqual(pinoOptions.messageKey, 'message');
			assert.strictEqual(pinoOptions.timestamp, 'mockIsoTime');

			assert.strictEqual(typeof pinoOptions.formatters, 'object');
			assert.strictEqual(typeof pinoOptions.formatters.level, 'function');
			assert.deepStrictEqual(pinoOptions.formatters.level('mock-level'), {
				level: 'mock-level'
			});

			assert.strictEqual(pinoOptions.transport, undefined);
		});

		it('sets the Pino logger level to "debug"', () => {
			assert.strictEqual(mockPinoLogger.level, 'debug');
		});

		describe('.baseLogData', () => {
			it('is set to an empty object', () => {
				assert.deepStrictEqual(logger.baseLogData, {});
			});
		});

		describe('.logLevel', () => {
			it('is set to "debug"', () => {
				assert.deepStrictEqual(logger.logLevel, 'debug');
			});
		});

		describe('.transport', () => {
			it('is set to the created Pino logger', () => {
				assert.strictEqual(logger.transport, mockPinoLogger);
			});
		});

		describe('.createChildLogger(baseLogData)', () => {
			let childLogger;

			beforeEach(() => {
				mock.method(Logger, 'getLogLevelInfo', Logger.getLogLevelInfo);
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
				assert.ok(childLogger instanceof Logger);
				assert.ok(childLogger !== logger);
				assert.ok(Logger.getLogLevelInfo.mock.callCount() > 0);
				assert.deepStrictEqual(Logger.getLogLevelInfo.mock.calls[0].arguments, [
					'mock parent level'
				]);
				assert.strictEqual(childLogger.transport, 'mock parent transport');
				assert.deepStrictEqual(childLogger.baseLogData, {
					isMockParentBaseData: true,
					isMockChildBaseData: true
				});
			});
		});

		describe('.addContext(additionalLogData)', () => {
			beforeEach(() => {
				mockPinoLogger.warn.mock.resetCalls();
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
				assert.deepStrictEqual(logger.baseLogData, {
					isExistingBaseLogData: true,
					isNewBaseLogData: true,
					mockProperty: 2
				});
			});

			it('logs a deprecation warning', () => {
				assert.strictEqual(mockPinoLogger.warn.mock.callCount(), 1);
				assert.deepStrictEqual(mockPinoLogger.warn.mock.calls[0].arguments, [
					{
						event: 'LOGGER_METHOD_DEPRECATED',
						message: "The 'addContext' logger method is deprecated",
						deprecatedMethod: 'addContext'
					}
				]);
			});

			describe('when called a second time', () => {
				beforeEach(() => {
					logger.addContext({});
				});

				it('does not log a second deprecation warning', () => {
					assert.strictEqual(mockPinoLogger.warn.mock.callCount(), 1);
				});
			});
		});

		describe('.setContext(contextData)', () => {
			beforeEach(() => {
				mockPinoLogger.warn.mock.resetCalls();
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
				assert.deepStrictEqual(logger.baseLogData.context, {
					isContextData: true,
					mockProperty: 2
				});
			});

			it('does not modify other `baseLogData` properties', () => {
				assert.strictEqual(logger.baseLogData.isBaseLogData, true);
			});

			it('logs a deprecation warning', () => {
				assert.strictEqual(mockPinoLogger.warn.mock.callCount(), 1);
				assert.deepStrictEqual(mockPinoLogger.warn.mock.calls[0].arguments, [
					{
						event: 'LOGGER_METHOD_DEPRECATED',
						message: "The 'setContext' logger method is deprecated",
						deprecatedMethod: 'setContext'
					}
				]);
			});

			describe('when called a second time', () => {
				beforeEach(() => {
					logger.setContext({});
				});

				it('does not log a second deprecation warning', () => {
					assert.strictEqual(mockPinoLogger.warn.mock.callCount(), 1);
				});
			});
		});

		describe('.clearContext(contextData)', () => {
			beforeEach(() => {
				mockPinoLogger.warn.mock.resetCalls();
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
				assert.strictEqual(logger.baseLogData.context, undefined);
			});

			it('does not modify other `baseLogData` properties', () => {
				assert.strictEqual(logger.baseLogData.isBaseLogData, true);
			});

			it('logs a deprecation warning', () => {
				assert.strictEqual(mockPinoLogger.warn.mock.callCount(), 1);
				assert.deepStrictEqual(mockPinoLogger.warn.mock.calls[0].arguments, [
					{
						event: 'LOGGER_METHOD_DEPRECATED',
						message: "The 'clearContext' logger method is deprecated",
						deprecatedMethod: 'clearContext'
					}
				]);
			});

			describe('when called a second time', () => {
				beforeEach(() => {
					logger.clearContext({});
				});

				it('does not log a second deprecation warning', () => {
					assert.strictEqual(mockPinoLogger.warn.mock.callCount(), 1);
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
				mockPinoLogger.mockCanonicalLevel.mock.resetCalls();
				mockPinoLogger.warn.mock.resetCalls();
				mock.method(Logger, 'getLogLevelInfo', () => ({
					logLevel: 'mockCanonicalLevel',
					isDeprecated: false
				}));
				mock.method(Logger, 'zipLogData', () => ({
					isMockZippedData: true,
					message: 'mock zipped message'
				}));
				logger.log('mockLevel', 'mock message', { mockData: true });
			});

			it('gets the log level information', () => {
				assert.strictEqual(Logger.getLogLevelInfo.mock.callCount(), 1);
				assert.deepStrictEqual(Logger.getLogLevelInfo.mock.calls[0].arguments, [
					'mockLevel'
				]);
			});

			it('zips all the log data alongside the logger `baseLogData` property', () => {
				assert.strictEqual(Logger.zipLogData.mock.callCount(), 1);
				assert.deepStrictEqual(Logger.zipLogData.mock.calls[0].arguments, [
					'mock message',
					{ mockData: true },
					{ mockBaseData: true }
				]);
			});

			it('calls the relevant log transport method for the level', () => {
				assert.strictEqual(mockPinoLogger.mockCanonicalLevel.mock.callCount(), 1);
				assert.deepStrictEqual(mockPinoLogger.mockCanonicalLevel.mock.calls[0].arguments, [
					{
						isMockZippedData: true,
						message: 'mock zipped message'
					}
				]);
			});

			it('does not log a warning', () => {
				assert.strictEqual(mockPinoLogger.warn.mock.callCount(), 0);
			});

			describe('when the log data does not include a message', () => {
				beforeEach(() => {
					mockPinoLogger.mockCanonicalLevel.mock.resetCalls();
					Logger.zipLogData.mock.mockImplementation(() => ({
						isMockZippedData: true
					}));
					logger.log('mockLevel', 'mock message', { mockData: true });
				});

				it('calls the relevant log transport method with a null message property', () => {
					assert.strictEqual(mockPinoLogger.mockCanonicalLevel.mock.callCount(), 1);
					assert.deepStrictEqual(
						mockPinoLogger.mockCanonicalLevel.mock.calls[0].arguments,
						[
							{
								isMockZippedData: true,
								message: null
							}
						]
					);
				});
			});

			describe('when the log data has an error property as a sub-property', () => {
				beforeEach(() => {
					mockPinoLogger.mockCanonicalLevel.mock.resetCalls();
					Logger.zipLogData.mock.mockImplementation(() => ({
						error: new Error('mock error'),
						isMockZippedData: true
					}));
					serializeError.mock.resetCalls();
					serializeError.mock.mockImplementationOnce(() => 'mock serialized error');
					logger.log('mockLevel', 'mock message', { mockData: true });
				});

				it('serializes the contents of the error sub-property', () => {
					assert.strictEqual(serializeError.mock.callCount(), 1);
					assert.deepStrictEqual(serializeError.mock.calls[0].arguments, [
						new Error('mock error')
					]);
				});

				it('calls the relevant log transport method with an error sub-property which is set to the serialized error', () => {
					assert.strictEqual(mockPinoLogger.mockCanonicalLevel.mock.callCount(), 1);
					assert.deepStrictEqual(
						mockPinoLogger.mockCanonicalLevel.mock.calls[0].arguments,
						[
							{
								isMockZippedData: true,
								message: null,
								error: 'mock serialized error'
							}
						]
					);
				});

				describe('when the error property is not an error instance', () => {
					beforeEach(() => {
						mockPinoLogger.mockCanonicalLevel.mock.resetCalls();
						Logger.zipLogData.mock.mockImplementation(() => ({
							error: 'not an error',
							isMockZippedData: true
						}));
						serializeError.mock.resetCalls();
						logger.log('mockLevel', 'mock message', { mockData: true });
					});

					it('does not serialize the error', () => {
						assert.strictEqual(serializeError.mock.callCount(), 0);
					});
				});
			});

			describe('when the log data has an err property as a sub-property', () => {
				beforeEach(() => {
					mockPinoLogger.mockCanonicalLevel.mock.resetCalls();
					Logger.zipLogData.mock.mockImplementation(() => ({
						err: new Error('mock error'),
						isMockZippedData: true
					}));
					serializeError.mock.resetCalls();
					serializeError.mock.mockImplementationOnce(() => 'mock serialized error');
					logger.log('mockLevel', 'mock message', { mockData: true });
				});

				it('serializes the contents of the err sub-property', () => {
					assert.strictEqual(serializeError.mock.callCount(), 1);
					assert.deepStrictEqual(serializeError.mock.calls[0].arguments, [
						new Error('mock error')
					]);
				});

				it('calls the relevant log transport method with an err sub-property which is set to the serialized error', () => {
					assert.strictEqual(mockPinoLogger.mockCanonicalLevel.mock.callCount(), 1);
					assert.deepStrictEqual(
						mockPinoLogger.mockCanonicalLevel.mock.calls[0].arguments,
						[
							{
								isMockZippedData: true,
								message: null,
								err: 'mock serialized error'
							}
						]
					);
				});
			});

			describe('when the given level is deprecated', () => {
				beforeEach(() => {
					mockPinoLogger.mockDeprecatedCanonocalLevel.mock.resetCalls();
					mockPinoLogger.warn.mock.resetCalls();
					Logger.getLogLevelInfo.mock.mockImplementation(() => ({
						logLevel: 'mockDeprecatedCanonocalLevel',
						isDeprecated: true,
						isDefaulted: false
					}));
					logger.log('mockDeprecatedLevel', 'mock message', { mockData: true });
				});

				it('calls the relevant log transport method for the level', () => {
					assert.strictEqual(
						mockPinoLogger.mockDeprecatedCanonocalLevel.mock.callCount(),
						1
					);
					assert.deepStrictEqual(
						mockPinoLogger.mockDeprecatedCanonocalLevel.mock.calls[0].arguments,
						[
							{
								isMockZippedData: true,
								message: 'mock zipped message'
							}
						]
					);
				});

				it('logs a deprecation warning', () => {
					assert.strictEqual(mockPinoLogger.warn.mock.callCount(), 1);
					assert.deepStrictEqual(mockPinoLogger.warn.mock.calls[0].arguments, [
						{
							event: 'LOG_LEVEL_DEPRECATED',
							message: "The 'mockDeprecatedLevel' log level is deprecated",
							deprecatedLevel: 'mockDeprecatedLevel',
							suggestedLevel: 'mockDeprecatedCanonocalLevel'
						}
					]);
				});

				describe('when a deprecated log level is used a second time', () => {
					beforeEach(() => {
						logger.log('mockDeprecatedLevel', 'mock message', {
							mockData: true
						});
					});

					it('does not log a second deprecation warning', () => {
						assert.strictEqual(mockPinoLogger.warn.mock.callCount(), 1);
					});
				});
			});

			describe('when the given level is invalid', () => {
				beforeEach(() => {
					mockPinoLogger.mockInvalidCanonicalLevel.mock.resetCalls();
					mockPinoLogger.warn.mock.resetCalls();
					Logger.getLogLevelInfo.mock.mockImplementation(() => ({
						logLevel: 'mockInvalidCanonicalLevel',
						isDeprecated: false,
						isDefaulted: true
					}));
					logger.log('mockInvalidLevel', 'mock message', { mockData: true });
				});

				it('calls the relevant log transport method for the level', () => {
					assert.strictEqual(
						mockPinoLogger.mockInvalidCanonicalLevel.mock.callCount(),
						1
					);
					assert.deepStrictEqual(
						mockPinoLogger.mockInvalidCanonicalLevel.mock.calls[0].arguments,
						[
							{
								isMockZippedData: true,
								message: 'mock zipped message'
							}
						]
					);
				});

				it('logs a warning', () => {
					assert.strictEqual(mockPinoLogger.warn.mock.callCount(), 1);
					assert.deepStrictEqual(mockPinoLogger.warn.mock.calls[0].arguments, [
						new Error('Invalid log level used'),
						{
							event: 'LOG_LEVEL_INVALID',
							message:
								"The 'mockInvalidLevel' log level is invalid, defaulting to 'mockInvalidCanonicalLevel'",
							invalidLevel: 'mockInvalidLevel',
							defaultedLevel: 'mockInvalidCanonicalLevel'
						}
					]);
				});

				describe('when an invalid log level is used a second time', () => {
					beforeEach(() => {
						logger.log('mockInvalidLevel', 'mock message', {
							mockData: true
						});
					});

					it('does not log a second deprecation warning', () => {
						assert.strictEqual(mockPinoLogger.warn.mock.callCount(), 1);
					});
				});
			});

			describe('when an error occurs during logging', () => {
				beforeEach(() => {
					serializeError.mock.resetCalls();
					mock.method(console, 'log', () => {});
					Logger.getLogLevelInfo.mock.mockImplementation(() => ({
						logLevel: 'mockErroringLevel',
						isDeprecated: true,
						isDefaulted: false
					}));
					logger.log('mockErroringLevel', 'mock message', { mockData: true });
				});

				it('logs the error information as JSON using `console.log`', () => {
					// biome-ignore lint/suspicious/noConsole: used in the code
					assert.strictEqual(console.log.mock.callCount(), 1);
					// biome-ignore lint/suspicious/noConsole: used in the code
					assert.deepStrictEqual(console.log.mock.calls[0].arguments, [
						JSON.stringify({
							level: 'error',
							event: 'LOG_METHOD_FAILURE',
							message: "Failed to log at level 'mockErroringLevel'",
							error: {
								isMockSerializedError: true
							}
						})
					]);
				});
			});

			describe('when `level` is not a string', () => {
				it('throws a type error', () => {
					assert.throws(
						() => logger.log({}),
						new TypeError('The log `level` argument must be a string')
					);
				});
			});
		});

		const logMethods = ['data', 'debug', 'error', 'fatal', 'info', 'silly', 'verbose', 'warn'];
		for (const levelMethod of logMethods) {
			describe(`.${levelMethod}(...logData)`, () => {
				beforeEach(() => {
					logger.log = mock.fn();
					logger[levelMethod]('mock message', { mockData: true });
				});

				it(`calls .log() with a level of '${levelMethod}'`, () => {
					assert.strictEqual(logger.log.mock.callCount(), 1);
					assert.deepStrictEqual(logger.log.mock.calls[0].arguments[0], levelMethod);
				});

				describe(`when the method is detatched from the logger instance`, () => {
					beforeEach(() => {
						logger.log.mock.resetCalls();
						const detatchedLogMethod = logger[levelMethod];
						detatchedLogMethod('mock message', { mockData: true });
					});

					it(`calls .log() with a level of '${levelMethod}'`, () => {
						assert.strictEqual(logger.log.mock.callCount(), 1);
						assert.deepStrictEqual(logger.log.mock.calls[0].arguments[0], levelMethod);
					});
				});
			});
		}

		describe('.flush()', () => {
			beforeEach(() => {
				logger.flush();
			});

			it('calls the `flush` method of the log transport', () => {
				assert.strictEqual(mockPinoLogger.flush.mock.callCount(), 1);
				assert.deepStrictEqual(mockPinoLogger.flush.mock.calls[0].arguments, []);
			});

			describe('when the log transport has no `flush` method', () => {
				beforeEach(() => {
					logger = new Logger({
						_transport: {}
					});
					mockPinoLogger.flush = mock.fn();
					logger.flush();
				});

				it('does nothing', () => {
					assert.strictEqual(mockPinoLogger.flush.mock.callCount(), 0);
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
					assert.deepStrictEqual(logger.baseLogData, {
						isMockBaseData: true,
						mockSubObject: { isMockSubObject: true }
					});
				});

				it('is a deep cloned copy of the original option', () => {
					baseLogData.a = 1;
					baseLogData.mockSubObject.a = 1;
					assert.strictEqual(logger.baseLogData.a, undefined);
					assert.strictEqual(logger.baseLogData.mockSubObject.a, undefined);
				});
			});
		});

		describe('when a `serializers` option is set', () => {
			let mockSerializers;

			beforeEach(() => {
				mock.method(Logger, 'getLogLevelInfo', () => ({
					logLevel: 'mockCanonicalLevel',
					isDeprecated: false
				}));
				mock.method(Logger, 'zipLogData', () => ({
					isMockZippedData: true,
					message: 'mock zipped message',
					time: 'mock zipped time',
					mockProperty1: 'mock-value-1'
				}));
				mock.method(console, 'log', () => {});
				mockPinoLogger.mockCanonicalLevel.mock.resetCalls();
				mockSerializers = {
					mockProperty1: mock.fn(() => 'mock-serialized-value-1'),
					mockProperty2: mock.fn(() => 'mock-serialized-value-2'),
					level: mock.fn(() => 'mock-serialized-level'),
					message: mock.fn(() => 'mock-serialized-message'),
					time: mock.fn(() => 'mock-serialized-time'),
					naughtyProperty: mock.fn(() => {
						throw new Error('We do not like this property');
					})
				};
				logger = new Logger({
					serializers: mockSerializers
				});
			});

			describe('.log(level, ...logData)', () => {
				beforeEach(() => {
					logger.log('mockLevel', 'mock message', { mockData: true });
				});

				it('calls all serializers with the zipped log data properties if set', () => {
					assert.strictEqual(mockSerializers.mockProperty1.mock.callCount(), 1);
					assert.strictEqual(mockSerializers.mockProperty2.mock.callCount(), 0);
					assert.deepStrictEqual(mockSerializers.mockProperty1.mock.calls[0].arguments, [
						'mock-value-1',
						'mockProperty1'
					]);
				});

				it('does not use custom serializers for level, message, and time log properties', () => {
					assert.strictEqual(mockSerializers.level.mock.callCount(), 0);
					assert.strictEqual(mockSerializers.message.mock.callCount(), 0);
					assert.strictEqual(mockSerializers.time.mock.callCount(), 0);
				});

				it('calls the relevant log transport method with the serialized log data', () => {
					assert.strictEqual(mockPinoLogger.mockCanonicalLevel.mock.callCount(), 1);
					assert.deepStrictEqual(
						mockPinoLogger.mockCanonicalLevel.mock.calls[0].arguments,
						[
							{
								isMockZippedData: true,
								message: 'mock zipped message',
								time: 'mock zipped time',
								mockProperty1: 'mock-serialized-value-1'
							}
						]
					);
				});

				describe('when a serializer errors', () => {
					it('logs the error information as JSON using `console.log`', () => {
						Logger.zipLogData.mock.mockImplementation(() => ({
							naughtyProperty: 'hello'
						}));
						logger.log('mockLevel', 'mock message', { mockData: true });

						// biome-ignore lint/suspicious/noConsole: used in the code
						assert.strictEqual(console.log.mock.callCount(), 1);
						// biome-ignore lint/suspicious/noConsole: used in the code
						assert.deepStrictEqual(console.log.mock.calls[0].arguments, [
							JSON.stringify({
								level: 'error',
								event: 'LOG_METHOD_FAILURE',
								message: "Failed to log at level 'mockLevel'",
								error: {
									isMockSerializedError: true
								}
							})
						]);
					});
				});
			});

			describe('when the serializers option is not an object', () => {
				it('throws a type error', () => {
					assert.throws(() => {
						logger = new Logger({
							serializers: []
						});
					}, new TypeError(
						'The `serializers` option must be an object where each property value is a function'
					));
				});
			});

			describe('when one of the serializers is not a function', () => {
				it('throws a type error', () => {
					assert.throws(() => {
						logger = new Logger({
							serializers: {
								mockProperty1: mock.fn(() => 'mock-serialized-value-1'),
								mockProperty2: 'nope'
							}
						});
					}, new TypeError(
						'The `serializers` option must be an object where each property value is a function'
					));
				});
			});
		});

		describe('when a `transforms` option is set', () => {
			let mockTransforms;

			beforeEach(() => {
				mock.method(Logger, 'getLogLevelInfo', () => ({
					logLevel: 'mockCanonicalLevel',
					isDeprecated: false
				}));
				mock.method(Logger, 'zipLogData', () => ({
					isMockZippedData: true,
					message: 'mock zipped message'
				}));
				mockPinoLogger.mockCanonicalLevel.mock.resetCalls();
				mockTransforms = [mock.fn(() => ({ isTransformedLogData: true }))];
				logger = new Logger({
					transforms: mockTransforms
				});
			});

			describe('.log(level, ...logData)', () => {
				beforeEach(() => {
					logger.log('mockLevel', 'mock message', { mockData: true });
				});

				it('calls the log transform with the zipped log data', () => {
					assert.strictEqual(mockTransforms[0].mock.callCount(), 1);
					assert.deepStrictEqual(mockTransforms[0].mock.calls[0].arguments, [
						{ isMockZippedData: true, message: 'mock zipped message' }
					]);
				});

				it('calls the relevant log transport method with the transformed log data', () => {
					assert.strictEqual(mockPinoLogger.mockCanonicalLevel.mock.callCount(), 1);
					assert.deepStrictEqual(
						mockPinoLogger.mockCanonicalLevel.mock.calls[0].arguments,
						[{ isTransformedLogData: true }]
					);
				});
			});

			describe('when multiple transforms are used', () => {
				beforeEach(() => {
					mockPinoLogger.mockCanonicalLevel.mock.resetCalls();
					mockTransforms = [
						...mockTransforms,
						mock.fn(() => ({ isSecondTransformedLogData: true }))
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
						assert.strictEqual(mockTransforms[0].mock.callCount(), 1);
						assert.deepStrictEqual(mockTransforms[0].mock.calls[0].arguments, [
							{ isMockZippedData: true, message: 'mock zipped message' }
						]);
						assert.strictEqual(mockTransforms[1].mock.callCount(), 1);
						assert.deepStrictEqual(mockTransforms[1].mock.calls[0].arguments, [
							{ isTransformedLogData: true }
						]);
					});

					it('calls the relevant log transport method with the final transformed log data', () => {
						assert.strictEqual(mockPinoLogger.mockCanonicalLevel.mock.callCount(), 1);
						assert.deepStrictEqual(
							mockPinoLogger.mockCanonicalLevel.mock.calls[0].arguments,
							[{ isSecondTransformedLogData: true }]
						);
					});
				});
			});

			describe('when the transforms option is not an array', () => {
				it('throws a type error', () => {
					assert.throws(() => {
						logger = new Logger({
							transforms: {}
						});
					}, new TypeError('The `transforms` option must be an array of functions'));
				});
			});

			describe('when one of the transforms is not a function', () => {
				it('throws a type error', () => {
					assert.throws(() => {
						logger = new Logger({
							transforms: [() => {}, 'nope']
						});
					}, new TypeError('The `transforms` option must be an array of functions'));
				});
			});
		});

		describe('when a `transport` option is set', () => {
			beforeEach(() => {
				pino.mock.resetCalls();
				logger = new Logger({
					_transport: 'mock transport'
				});
			});

			it('does not create a Pino logger', () => {
				assert.strictEqual(pino.mock.callCount(), 0);
			});

			describe('.transport', () => {
				it('is set to the value of the `transport` option', () => {
					assert.strictEqual(logger.transport, 'mock transport');
				});
			});
		});

		describe('when the `logLevel` option is set', () => {
			beforeEach(() => {
				process.env.LOG_LEVEL = 'mockEnvLogLevel';
				process.env.SPLUNK_LOG_LEVEL = 'mockEnvSplunkLogLevel';
				mock.method(Logger, 'getLogLevelInfo', () => ({
					logLevel: 'mockCanonicalLevel'
				}));
				logger = new Logger({
					logLevel: 'mockLevel'
				});
			});

			it('gets the log level information', () => {
				assert.strictEqual(Logger.getLogLevelInfo.mock.callCount(), 1);
				assert.deepStrictEqual(Logger.getLogLevelInfo.mock.calls[0].arguments, [
					'mockLevel'
				]);
			});

			it('sets the Pino logger level to the `logLevel` of the log level information', () => {
				assert.strictEqual(mockPinoLogger.level, 'mockCanonicalLevel');
			});

			describe('.logLevel', () => {
				it('is set to the `logLevel` of the log level information', () => {
					assert.strictEqual(logger.logLevel, 'mockCanonicalLevel');
				});
			});
		});

		describe('when a `LOG_LEVEL` environment variable is set', () => {
			beforeEach(() => {
				process.env.LOG_LEVEL = 'mockEnvLogLevel';
				process.env.SPLUNK_LOG_LEVEL = 'mockEnvSplunkLogLevel';
				mock.method(Logger, 'getLogLevelInfo', () => ({
					logLevel: 'mockCanonicalLevel'
				}));
				logger = new Logger();
			});

			it('gets the log level information based on the environment variable', () => {
				assert.strictEqual(Logger.getLogLevelInfo.mock.callCount(), 1);
				assert.deepStrictEqual(Logger.getLogLevelInfo.mock.calls[0].arguments, [
					'mockEnvLogLevel'
				]);
			});
		});

		describe('when a `SPLUNK_LOG_LEVEL` environment variable is set', () => {
			beforeEach(() => {
				delete process.env.LOG_LEVEL;
				process.env.SPLUNK_LOG_LEVEL = 'mockEnvSplunkLogLevel';
				mock.method(Logger, 'getLogLevelInfo', () => ({
					logLevel: 'mockCanonicalLevel'
				}));
				logger = new Logger();
			});

			it('gets the log level information based on the environment variable', () => {
				assert.strictEqual(Logger.getLogLevelInfo.mock.callCount(), 1);
				assert.deepStrictEqual(Logger.getLogLevelInfo.mock.calls[0].arguments, [
					'mockEnvSplunkLogLevel'
				]);
			});
		});

		describe('when pino-pretty is installed and the environment is not "production" - e.g. "development', () => {
			let Logger;

			beforeEach((test) => {
				test.mock.module('@dotcom-reliability-kit/serialize-error', {
					defaultExport: serializeError
				});
				test.mock.module('pino', { defaultExport: pino });
				test.mock.module('pino-pretty', { defaultExport: mock.fn() });
				test.mock.module('@dotcom-reliability-kit/app-info', {
					defaultExport: { cloudProvider: null, environment: 'development' }
				});

				// We have to clear the module cache because the checks for pino-pretty are done
				// on module load for performance reasons
				delete require.cache[require.resolve('../../../lib/logger.js')];
				Logger = require('../../../lib/logger.js');

				pino.mock.resetCalls();
				logger = new Logger();
			});

			it('configures the created Pino logger with prettification', () => {
				const pinoOptions = pino.mock.calls[0].arguments[0];
				assert.strictEqual(typeof pinoOptions.transport, 'object');
				assert.deepStrictEqual(pinoOptions.transport, {
					target: 'pino-pretty',
					worker: { execArgv: [] },
					options: {
						colorize: true,
						messageKey: 'message'
					}
				});
			});
		});

		describe('when pino-pretty is installed and the environment is not "production" - e.g. "test', () => {
			let Logger;

			beforeEach((test) => {
				test.mock.module('@dotcom-reliability-kit/serialize-error', {
					defaultExport: serializeError
				});
				test.mock.module('pino', { defaultExport: pino });
				test.mock.module('pino-pretty', { defaultExport: mock.fn() });
				test.mock.module('@dotcom-reliability-kit/app-info', {
					defaultExport: { cloudProvider: null, environment: 'test' }
				});

				// We have to clear the module cache because the checks for pino-pretty are done
				// on module load for performance reasons
				delete require.cache[require.resolve('../../../lib/logger.js')];
				Logger = require('../../../lib/logger.js');

				pino.mock.resetCalls();
				logger = new Logger();
			});

			it('configures the created Pino logger with prettification', () => {
				const pinoOptions = pino.mock.calls[0].arguments[0];
				assert.strictEqual(typeof pinoOptions.transport, 'object');
				assert.deepStrictEqual(pinoOptions.transport, {
					target: 'pino-pretty',
					worker: { execArgv: [] },
					options: {
						colorize: true,
						messageKey: 'message'
					}
				});
			});
		});

		describe('when pino-pretty is installed and the `withPrettifier` option is set to `false`', () => {
			let Logger;

			beforeEach((test) => {
				test.mock.module('@dotcom-reliability-kit/serialize-error', {
					defaultExport: serializeError
				});
				test.mock.module('pino', { defaultExport: pino });
				test.mock.module('pino-pretty', { defaultExport: mock.fn() });
				test.mock.module('@dotcom-reliability-kit/app-info', {
					defaultExport: { cloudProvider: null, environment: 'development' }
				});

				// We have to clear the module cache because the checks for pino-pretty are done
				// on module load for performance reasons
				delete require.cache[require.resolve('../../../lib/logger.js')];
				Logger = require('../../../lib/logger.js');

				pino.mock.resetCalls();
				logger = new Logger({ withPrettifier: false });
			});

			it('does not configure the created Pino logger with prettification', () => {
				const pinoOptions = pino.mock.calls[0].arguments[0];
				assert.strictEqual(pinoOptions.transport, undefined);
			});
		});

		describe('when pino-pretty is installed and the `LOG_DISABLE_PRETTIFIER` environment variable is set', () => {
			let Logger;

			beforeEach((test) => {
				test.mock.module('@dotcom-reliability-kit/serialize-error', {
					defaultExport: serializeError
				});
				test.mock.module('pino', { defaultExport: pino });
				test.mock.module('pino-pretty', { defaultExport: mock.fn() });
				test.mock.module('@dotcom-reliability-kit/app-info', {
					defaultExport: { cloudProvider: null, environment: 'development' }
				});
				process.env.LOG_DISABLE_PRETTIFIER = 'true';

				// We have to clear the module cache because the checks for pino-pretty are done
				// on module load for performance reasons
				delete require.cache[require.resolve('../../../lib/logger.js')];
				Logger = require('../../../lib/logger.js');

				pino.mock.resetCalls();
				logger = new Logger();
			});

			it('does not configure the created Pino logger with prettification', () => {
				const pinoOptions = pino.mock.calls[0].arguments[0];
				assert.strictEqual(pinoOptions.transport, undefined);
			});
		});

		describe('when pino-pretty is installed and the environment is "production", "prod", or "p"', () => {
			beforeEach((test) => {
				test.mock.module('@dotcom-reliability-kit/serialize-error', {
					defaultExport: serializeError
				});
				test.mock.module('pino', { defaultExport: pino });
				test.mock.module('pino-pretty', { defaultExport: mock.fn() });

				const appInfo = { cloudProvider: null, environment: 'nope' };
				test.mock.module('@dotcom-reliability-kit/app-info', {
					cache: true,
					defaultExport: appInfo
				});

				pino.mock.resetCalls();
				for (const environment of ['production', 'prod', 'p']) {
					let Logger;

					appInfo.environment = environment;

					// We have to clear the module cache because the checks for pino-pretty are done
					// on module load for performance reasons
					delete require.cache[require.resolve('../../../lib/logger.js')];
					Logger = require('../../../lib/logger.js');

					logger = new Logger();
				}
			});

			it('does not configure the created Pino logger with prettification', () => {
				assert.strictEqual(pino.mock.callCount(), 3);
				for (const call of pino.mock.calls) {
					assert.strictEqual(call.arguments[0].transport, undefined);
				}
			});
		});

		describe('when pino-pretty is installed and AWS is detected as a cloud provider', () => {
			let Logger;

			beforeEach((test) => {
				test.mock.module('@dotcom-reliability-kit/serialize-error', {
					defaultExport: serializeError
				});
				test.mock.module('pino', { defaultExport: pino });
				test.mock.module('pino-pretty', { defaultExport: mock.fn() });
				test.mock.module('@dotcom-reliability-kit/app-info', {
					defaultExport: { cloudProvider: 'aws', environment: 'development' }
				});

				// We have to clear the module cache because the checks for pino-pretty are done
				// on module load for performance reasons
				delete require.cache[require.resolve('../../../lib/logger.js')];
				Logger = require('../../../lib/logger.js');

				pino.mock.resetCalls();
				logger = new Logger();
			});

			it('does not configure the created Pino logger with prettification', () => {
				const pinoOptions = pino.mock.calls[0].arguments[0];
				assert.strictEqual(pinoOptions.transport, undefined);
			});
		});

		describe('when pino-pretty is not installed and the environment is "development"', () => {
			let Logger;

			beforeEach((test) => {
				test.mock.module('@dotcom-reliability-kit/serialize-error', {
					defaultExport: serializeError
				});
				test.mock.module('pino', { defaultExport: pino });
				test.mock.module('pino-pretty', { defaultExport: undefined });
				test.mock.module('@dotcom-reliability-kit/app-info', {
					defaultExport: { cloudProvider: null, environment: 'development' }
				});

				// We have to clear the module cache because the checks for pino-pretty are done
				// on module load for performance reasons
				delete require.cache[require.resolve('../../../lib/logger.js')];
				Logger = require('../../../lib/logger.js');

				pino.mock.resetCalls();
				logger = new Logger();
			});

			it('configures the created Pino logger without prettification', () => {
				const pinoOptions = pino.mock.calls[0].arguments[0];
				assert.strictEqual(pinoOptions.transport, undefined);
			});
		});
	});

	describe('Logger.getLogLevelInfo(level)', () => {
		describe('when `level` is "data"', () => {
			it('returns the expected log level information', () => {
				assert.deepStrictEqual(Logger.getLogLevelInfo('data'), {
					logLevel: 'debug',
					isDeprecated: true,
					isDefaulted: false
				});
			});
		});

		describe('when `level` is "debug"', () => {
			it('returns the expected log level information', () => {
				assert.deepStrictEqual(Logger.getLogLevelInfo('debug'), {
					logLevel: 'debug',
					isDeprecated: false,
					isDefaulted: false
				});
			});
		});

		describe('when `level` is "error"', () => {
			it('returns the expected log level information', () => {
				assert.deepStrictEqual(Logger.getLogLevelInfo('error'), {
					logLevel: 'error',
					isDeprecated: false,
					isDefaulted: false
				});
			});
		});

		describe('when `level` is "fatal"', () => {
			it('returns the expected log level information', () => {
				assert.deepStrictEqual(Logger.getLogLevelInfo('fatal'), {
					logLevel: 'fatal',
					isDeprecated: false,
					isDefaulted: false
				});
			});
		});

		describe('when `level` is "info"', () => {
			it('returns the expected log level information', () => {
				assert.deepStrictEqual(Logger.getLogLevelInfo('info'), {
					logLevel: 'info',
					isDeprecated: false,
					isDefaulted: false
				});
			});
		});

		describe('when `level` is "silly"', () => {
			it('returns the expected log level information', () => {
				assert.deepStrictEqual(Logger.getLogLevelInfo('silly'), {
					logLevel: 'debug',
					isDeprecated: true,
					isDefaulted: false
				});
			});
		});

		describe('when `level` is "verbose"', () => {
			it('returns the expected log level information', () => {
				assert.deepStrictEqual(Logger.getLogLevelInfo('verbose'), {
					logLevel: 'debug',
					isDeprecated: true,
					isDefaulted: false
				});
			});
		});

		describe('when `level` is "warn"', () => {
			it('returns the expected log level information', () => {
				assert.deepStrictEqual(Logger.getLogLevelInfo('warn'), {
					logLevel: 'warn',
					isDeprecated: false,
					isDefaulted: false
				});
			});
		});

		describe('when `level` is invalid', () => {
			it('returns default log level information', () => {
				assert.deepStrictEqual(Logger.getLogLevelInfo('unknown'), {
					logLevel: 'info',
					isDeprecated: false,
					isDefaulted: true
				});
			});
		});
	});

	describe('Logger.zipLogData(...logData)', () => {
		it('zips multiple log data items into a single object', () => {
			assert.deepStrictEqual(Logger.zipLogData({ a: 1 }, { b: 2 }, { c: 3 }), {
				a: 1,
				b: 2,
				c: 3
			});
		});

		it('returns a deep cloned copy of the resulting object', () => {
			const object1 = { a: 1, sub: { a: true } };
			const object2 = { b: 2, sub: { b: true } };
			const zip = Logger.zipLogData(object1, object2);
			assert.notStrictEqual(zip, object1);
			assert.notStrictEqual(zip, object2);
			assert.strictEqual(object1.b, undefined);
			assert.strictEqual(object2.a, undefined);
			object1.newProperty = true;
			object1.sub.newProperty = true;
			object2.newProperty = true;
			object2.sub.newProperty = true;
			assert.strictEqual(zip.newProperty, undefined);
			assert.strictEqual(zip.sub.newProperty, undefined);
		});

		describe('when there are property conflicts between objects', () => {
			it('prioritizes the first instance of that property', () => {
				assert.deepStrictEqual(Logger.zipLogData({ a: 1 }, { a: 2 }, { a: 3 }), {
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
				assert.deepStrictEqual(Logger.zipLogData({ error: mockError }), {
					error: mockError
				});
				assert.ok(Logger.zipLogData({ error: mockError }).error instanceof MockError);
				assert.deepStrictEqual(
					Logger.zipLogData({ error: mockError }).error.name,
					'MockError'
				);
				assert.deepStrictEqual(
					Logger.zipLogData({ error: mockError }).error.code,
					'MOCK_ERROR'
				);
			});
		});

		describe('when one of the log data items is a string', () => {
			it('adds it as a `message` property', () => {
				assert.deepStrictEqual(Logger.zipLogData('mock message', { a: 1 }), {
					message: 'mock message',
					a: 1
				});
			});

			describe('when there are multiple strings', () => {
				it('prioritizes the first', () => {
					assert.deepStrictEqual(Logger.zipLogData('message 1', 'message 2'), {
						message: 'message 1'
					});
				});
			});
		});

		describe('when one of the log data items is an error object', () => {
			it('serializes it and adds it as an `error` property', () => {
				serializeError.mock.resetCalls();
				serializeError.mock.mockImplementationOnce(() => 'mock serialized error');
				const error = new Error('mock error');

				assert.deepStrictEqual(Logger.zipLogData(error), {
					error: 'mock serialized error'
				});
				assert.strictEqual(serializeError.mock.callCount(), 1);
				assert.deepStrictEqual(serializeError.mock.calls[0].arguments, [error]);
			});

			describe('when there are multiple errors', () => {
				it('prioritizes the first', () => {
					serializeError.mock.mockImplementation((error) => {
						return `mock serialized ${error.message}`;
					});
					const error1 = new Error('error 1');
					const error2 = new Error('error 2');
					assert.deepStrictEqual(Logger.zipLogData(error1, error2), {
						error: 'mock serialized error 1'
					});
				});
			});
		});

		describe('when a mix of data types is used', () => {
			it('correctly zips all of them', () => {
				serializeError.mock.mockImplementationOnce(() => 'mock serialized error');
				const error = new Error('mock error');

				assert.deepStrictEqual(
					Logger.zipLogData('mock message', error, { a: 1 }, { b: 2 }),
					{
						message: 'mock message',
						error: 'mock serialized error',
						a: 1,
						b: 2
					}
				);
			});
		});
	});
});
