const registerCrashHandler = require('../../../lib');

jest.mock('@dotcom-reliability-kit/log-error', () => ({
	logUnhandledError: jest.fn()
}));
const { logUnhandledError } = require('@dotcom-reliability-kit/log-error');

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
				on: jest.fn()
			};

			registerCrashHandler({
				process: mockProcess
			});
		});

		it('binds a handler to the process `uncaughtException` event', () => {
			expect(mockProcess.on).toBeCalledTimes(1);
			expect(mockProcess.on).toBeCalledWith(
				'uncaughtException',
				expect.any(Function)
			);
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
				expect(logUnhandledError).toBeCalledTimes(1);
				expect(logUnhandledError).toBeCalledWith({ error });
			});

			it('exits the process with a code of `1`', () => {
				expect(mockProcess.exit).toBeCalledTimes(1);
				expect(mockProcess.exit).toBeCalledWith(1);
			});

			describe('when the process has a defined exit code already', () => {
				beforeEach(() => {
					mockProcess.exit.mockReset();
					mockProcess.exitCode = 137;
					uncaughtExceptionHandler(error);
				});

				it('exits the process with the given code', () => {
					expect(mockProcess.exit).toBeCalledTimes(1);
					expect(mockProcess.exit).toBeCalledWith(137);
				});
			});
		});

		describe('when `options.process` is undefined', () => {
			let mockGlobalProcess;
			let originalProcess;

			beforeEach(() => {
				originalProcess = global.process;
				global.process = mockGlobalProcess = {
					on: jest.fn()
				};

				registerCrashHandler({});
			});

			afterEach(() => {
				global.process = originalProcess;
			});

			it('binds a handler to the global process `uncaughtException` event', () => {
				expect(mockGlobalProcess.on).toBeCalledTimes(1);
				expect(mockGlobalProcess.on).toBeCalledWith(
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
					on: jest.fn()
				};

				registerCrashHandler();
			});

			afterEach(() => {
				global.process = originalProcess;
			});

			it('binds a handler to the global process `uncaughtException` event', () => {
				expect(mockGlobalProcess.on).toBeCalledTimes(1);
				expect(mockGlobalProcess.on).toBeCalledWith(
					'uncaughtException',
					expect.any(Function)
				);
			});
		});
	});
});
