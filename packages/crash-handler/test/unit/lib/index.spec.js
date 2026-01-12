const registerCrashHandler = require('../../../lib');

jest.mock('@dotcom-reliability-kit/log-error', () => ({
	logHandledError: jest.fn(),
	logUnhandledError: jest.fn()
}));
const { logHandledError, logUnhandledError } = require('@dotcom-reliability-kit/log-error');

describe('@dotcom-reliability-kit/crash-handler', () => {
	describe('.default', () => {
		it('aliases the module exports', () => {
			expect(registerCrashHandler.default).toStrictEqual(registerCrashHandler);
		});
	});

	describe('registerCrashHandler(options)', () => {
		let mockProcess;

		beforeEach(() => {
			mockProcess = {
				exit: jest.fn(),
				on: jest.fn(),
				listeners: jest.fn().mockReturnValue([])
			};

			registerCrashHandler({
				process: mockProcess
			});
		});

		it('binds a handler to the process `uncaughtException` event', () => {
			expect(mockProcess.on).toHaveBeenCalledTimes(1);
			expect(mockProcess.on).toHaveBeenCalledWith('uncaughtException', expect.any(Function));
		});

		describe('uncaughtExceptionHandler(error)', () => {
			let error;
			let uncaughtExceptionHandler;

			beforeEach(() => {
				error = new Error('mock error');
				uncaughtExceptionHandler = mockProcess.on.mock.calls[0][1];
				uncaughtExceptionHandler(error);
			});

			it('logs the error as being unhandled', () => {
				expect(logUnhandledError).toHaveBeenCalledTimes(1);
				expect(logUnhandledError).toHaveBeenCalledWith({ error });
			});

			it('exits the process with a code of `1`', () => {
				expect(mockProcess.exit).toHaveBeenCalledTimes(1);
				expect(mockProcess.exit).toHaveBeenCalledWith(1);
			});

			describe('when the process has a defined exit code already', () => {
				beforeEach(() => {
					mockProcess.exit.mockReset();
					mockProcess.exitCode = 137;
					uncaughtExceptionHandler(error);
				});

				it('exits the process with the given code', () => {
					expect(mockProcess.exit).toHaveBeenCalledTimes(1);
					expect(mockProcess.exit).toHaveBeenCalledWith(137);
				});
			});
		});

		describe('when `options.logger` is set', () => {
			beforeEach(() => {
				mockProcess.on.mockReset();
				logUnhandledError.mockReset();
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
					uncaughtExceptionHandler = mockProcess.on.mock.calls[0][1];
					uncaughtExceptionHandler(error);
				});

				it('logs the error as being unhandled with the custom logger', () => {
					expect(logUnhandledError).toHaveBeenCalledTimes(1);
					expect(logUnhandledError).toHaveBeenCalledWith({
						error,
						logger: 'mock-logger'
					});
				});
			});
		});

		describe('when `options.process` is undefined', () => {
			let mockGlobalProcess;
			let originalProcess;

			beforeEach(() => {
				originalProcess = global.process;
				global.process = mockGlobalProcess = {
					on: jest.fn(),
					listeners: jest.fn().mockReturnValue([])
				};

				registerCrashHandler({});
			});

			afterEach(() => {
				global.process = originalProcess;
			});

			it('binds a handler to the global process `uncaughtException` event', () => {
				expect(mockGlobalProcess.on).toHaveBeenCalledTimes(1);
				expect(mockGlobalProcess.on).toHaveBeenCalledWith(
					'uncaughtException',
					expect.any(Function)
				);
			});
		});

		describe('when no options are set', () => {
			let mockGlobalProcess;
			let originalProcess;

			beforeEach(() => {
				originalProcess = global.process;
				global.process = mockGlobalProcess = {
					on: jest.fn(),
					listeners: jest.fn().mockReturnValue([])
				};

				registerCrashHandler();
			});

			afterEach(() => {
				global.process = originalProcess;
			});

			it('binds a handler to the global process `uncaughtException` event', () => {
				expect(mockGlobalProcess.on).toHaveBeenCalledTimes(1);
				expect(mockGlobalProcess.on).toHaveBeenCalledWith(
					'uncaughtException',
					expect.any(Function)
				);
			});
		});

		describe('when the procss already has an uncaughtExceptionHandler', () => {
			beforeEach(() => {
				mockProcess.on.mockReset();
				mockProcess.listeners.mockReturnValue(['mockHandler']);
				logHandledError.mockReset();
				registerCrashHandler({
					process: mockProcess,
					logger: 'mock-logger'
				});
			});

			it('does not bind a handler to the process `uncaughtException` event', () => {
				expect(mockProcess.on).toHaveBeenCalledTimes(0);
			});

			it('logs a warning that the Crash Handler has not been registered', () => {
				expect(logHandledError).toHaveBeenCalledTimes(1);
				const call = logHandledError.mock.calls[0][0];
				expect(call).toBeInstanceOf(Object);
				expect(call.logger).toStrictEqual('mock-logger');
				expect(call.error).toBeInstanceOf(Error);
				expect(call.error.code).toStrictEqual('CRASH_HANDLER_NOT_REGISTERED');
			});
		});
	});
});
