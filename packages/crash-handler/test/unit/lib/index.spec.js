const { afterEach, beforeEach, describe, it, mock } = require('node:test');
const assert = require('node:assert/strict');

const logHandledError = mock.fn();
const logUnhandledError = mock.fn();
mock.module('@dotcom-reliability-kit/log-error', {
	namedExports: { logHandledError, logUnhandledError }
});

const registerCrashHandler = require('@dotcom-reliability-kit/crash-handler');

describe('@dotcom-reliability-kit/crash-handler', () => {
	describe('.default', () => {
		it('aliases the module exports', () => {
			assert.strictEqual(registerCrashHandler.default, registerCrashHandler);
		});
	});

	describe('registerCrashHandler(options)', () => {
		let mockProcess;

		beforeEach(() => {
			mockProcess = {
				exit: mock.fn(),
				on: mock.fn(),
				listeners: mock.fn(() => [])
			};

			registerCrashHandler({
				process: mockProcess
			});
		});

		it('binds a handler to the process `uncaughtException` event', () => {
			assert.strictEqual(mockProcess.on.mock.callCount(), 1);
			assert.strictEqual(mockProcess.on.mock.calls[0].arguments[0], 'uncaughtException');
			assert.strictEqual(typeof mockProcess.on.mock.calls[0].arguments[1], 'function');
		});

		describe('uncaughtExceptionHandler(error)', () => {
			let error;
			let uncaughtExceptionHandler;

			beforeEach(() => {
				error = new Error('mock error');
				uncaughtExceptionHandler = mockProcess.on.mock.calls[0].arguments[1];
				uncaughtExceptionHandler(error);
			});

			it('logs the error as being unhandled', () => {
				assert.strictEqual(logUnhandledError.mock.callCount(), 1);
				assert.partialDeepStrictEqual(logUnhandledError.mock.calls[0].arguments, [
					{ error }
				]);
			});

			it('exits the process with a code of `1`', () => {
				assert.strictEqual(mockProcess.exit.mock.callCount(), 1);
				assert.deepStrictEqual(mockProcess.exit.mock.calls[0].arguments, [1]);
			});

			describe('when the process has a defined exit code already', () => {
				beforeEach(() => {
					mockProcess.exit.mock.resetCalls();
					mockProcess.exitCode = 137;
					uncaughtExceptionHandler(error);
				});

				it('exits the process with the given code', () => {
					assert.strictEqual(mockProcess.exit.mock.callCount(), 1);
					assert.deepStrictEqual(mockProcess.exit.mock.calls[0].arguments, [137]);
				});
			});
		});

		describe('when `options.logger` is set', () => {
			beforeEach(() => {
				mockProcess.on.mock.resetCalls();
				logUnhandledError.mock.resetCalls();
				registerCrashHandler({
					logger: 'mock-logger',
					process: mockProcess
				});
			});

			describe('uncaughtExceptionHandler(error)', () => {
				let error;
				let uncaughtExceptionHandler;

				beforeEach(() => {
					error = new Error('mock error');
					uncaughtExceptionHandler = mockProcess.on.mock.calls[0].arguments[1];
					uncaughtExceptionHandler(error);
				});

				it('logs the error as being unhandled with the custom logger', () => {
					assert.strictEqual(logUnhandledError.mock.callCount(), 1);
					assert.deepStrictEqual(logUnhandledError.mock.calls[0].arguments, [
						{
							error,
							logger: 'mock-logger'
						}
					]);
				});
			});
		});

		describe('when `options.process` is undefined', () => {
			let mockGlobalProcess;
			let originalProcess;

			beforeEach(() => {
				originalProcess = global.process;
				global.process = mockGlobalProcess = {
					on: mock.fn(),
					listeners: mock.fn(() => [])
				};

				registerCrashHandler({});
			});

			afterEach(() => {
				global.process = originalProcess;
			});

			it('binds a handler to the global process `uncaughtException` event', () => {
				assert.strictEqual(mockGlobalProcess.on.mock.callCount(), 1);
				assert.strictEqual(
					mockGlobalProcess.on.mock.calls[0].arguments[0],
					'uncaughtException'
				);
				assert.strictEqual(
					typeof mockGlobalProcess.on.mock.calls[0].arguments[1],
					'function'
				);
			});
		});

		describe('when no options are set', () => {
			let mockGlobalProcess;
			let originalProcess;

			beforeEach(() => {
				originalProcess = global.process;
				global.process = mockGlobalProcess = {
					on: mock.fn(),
					listeners: mock.fn(() => [])
				};

				registerCrashHandler();
			});

			afterEach(() => {
				global.process = originalProcess;
			});

			it('binds a handler to the global process `uncaughtException` event', () => {
				assert.strictEqual(mockGlobalProcess.on.mock.callCount(), 1);
				assert.strictEqual(
					mockGlobalProcess.on.mock.calls[0].arguments[0],
					'uncaughtException'
				);
				assert.strictEqual(
					typeof mockGlobalProcess.on.mock.calls[0].arguments[1],
					'function'
				);
			});
		});

		describe('when the procss already has an uncaughtExceptionHandler', () => {
			beforeEach(() => {
				mockProcess.on.mock.resetCalls();
				mockProcess.listeners.mock.mockImplementation(() => ['mockHandler']);
				logHandledError.mock.resetCalls();
				registerCrashHandler({
					process: mockProcess,
					logger: 'mock-logger'
				});
			});

			it('does not bind a handler to the process `uncaughtException` event', () => {
				assert.strictEqual(mockProcess.on.mock.callCount(), 0);
			});

			it('logs a warning that the Crash Handler has not been registered', () => {
				assert.strictEqual(logHandledError.mock.callCount(), 1);
				const call = logHandledError.mock.calls[0].arguments[0];
				assert.ok(call instanceof Object);
				assert.strictEqual(call.logger, 'mock-logger');
				assert.ok(call.error instanceof Error);
				assert.strictEqual(call.error.code, 'CRASH_HANDLER_NOT_REGISTERED');
			});
		});
	});
});
