import assert from 'node:assert/strict';
import { afterEach, beforeEach, describe, it, type Mock, mock } from 'node:test';
import type { Logger } from '@dotcom-reliability-kit/logger';

const logHandledError = mock.fn();
const logUnhandledError = mock.fn();
mock.module('@dotcom-reliability-kit/log-error', {
	namedExports: { logHandledError, logUnhandledError }
});

const { default: registerCrashHandler } = await import('../../index.ts');

type MockProcessType = {
	on: Mock<NodeJS.Process['on']>;
	exit: Mock<NodeJS.Process['exit']>;
	exitCode?: NodeJS.Process['exitCode'];
	listeners: Mock<NodeJS.Process['listeners']>;
};

describe('@dotcom-reliability-kit/crash-handler', () => {
	describe('registerCrashHandler(options)', () => {
		let mockProcess: MockProcessType;

		beforeEach(() => {
			mockProcess = {
				exit: mock.fn(),
				on: mock.fn(),
				listeners: mock.fn(() => [])
			};

			registerCrashHandler({
				process: mockProcess as unknown as NodeJS.Process
			});
		});

		it('binds a handler to the process `uncaughtException` event', () => {
			assert.strictEqual(mockProcess.on.mock.callCount(), 1);
			assert.strictEqual(mockProcess.on.mock.calls[0].arguments[0], 'uncaughtException');
			assert.strictEqual(typeof mockProcess.on.mock.calls[0].arguments[1], 'function');
		});

		describe('uncaughtExceptionHandler(error)', () => {
			let error: Error & Record<string, any>;
			let uncaughtExceptionHandler: (...args: any[]) => void;

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
			const mockedLogger = {} as Logger;
			beforeEach(() => {
				mockProcess.on.mock.resetCalls();
				logUnhandledError.mock.resetCalls();
				registerCrashHandler({
					logger: mockedLogger,
					process: mockProcess as unknown as NodeJS.Process
				});
			});

			describe('uncaughtExceptionHandler(error)', () => {
				let error: Error & Record<string, any>;
				let uncaughtExceptionHandler: (...args: any[]) => void;

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
							logger: mockedLogger
						}
					]);
				});
			});
		});

		describe('when `options.process` is undefined', () => {
			let mockGlobalProcess: MockProcessType;
			let originalProcess: NodeJS.Process;

			beforeEach(() => {
				originalProcess = global.process;

				mockGlobalProcess = {
					on: mock.fn(),
					listeners: mock.fn(() => []),
					exit: mock.fn(),
					exitCode: undefined
				};
				global.process = mockGlobalProcess as unknown as NodeJS.Process;

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
			let mockGlobalProcess: MockProcessType;
			let originalProcess: NodeJS.Process;

			beforeEach(() => {
				originalProcess = global.process;
				mockGlobalProcess = {
					on: mock.fn(),
					listeners: mock.fn(() => []),
					exit: mock.fn(),
					exitCode: undefined
				};
				global.process = mockGlobalProcess as unknown as NodeJS.Process;

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
			const mockedLogger = {} as Logger;
			const mockHandler = () => {};
			beforeEach(() => {
				mockProcess.on.mock.resetCalls();
				mockProcess.listeners.mock.mockImplementation(() => [mockHandler]);
				logHandledError.mock.resetCalls();
				registerCrashHandler({
					process: mockProcess as unknown as NodeJS.Process,
					logger: mockedLogger
				});
			});

			it('does not bind a handler to the process `uncaughtException` event', () => {
				assert.strictEqual(mockProcess.on.mock.callCount(), 0);
			});

			it('logs a warning that the Crash Handler has not been registered', () => {
				assert.strictEqual(logHandledError.mock.callCount(), 1);
				const call = logHandledError.mock.calls[0].arguments[0];
				assert.ok(call instanceof Object);
				assert.strictEqual(call.logger, mockedLogger);
				assert.ok(call.error instanceof Error);
				assert.strictEqual(call.error.code, 'CRASH_HANDLER_NOT_REGISTERED');
			});
		});
	});
});
