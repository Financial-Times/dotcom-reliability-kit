const BaseError = require('../../../lib/base-error');
const OperationalError = require('../../../lib/operational-error');

describe('@dotcom-reliability-kit/errors/lib/base-error', () => {
	afterEach(() => {
		jest.restoreAllMocks();
	});

	it('exports a class', () => {
		expect(BaseError).toBeInstanceOf(Function);
		expect(() => {
			BaseError();
		}).toThrow(/class constructor/i);
	});

	it('extends the global Error class', () => {
		expect(BaseError.prototype).toBeInstanceOf(Error);
	});

	describe('new BaseError()', () => {
		let instance;

		beforeEach(() => {
			instance = new BaseError();
		});

		describe('.code', () => {
			it('is set to "UNKNOWN"', () => {
				expect(instance.code).toStrictEqual('UNKNOWN');
			});
		});

		describe('.data', () => {
			it('is set to an empty object', () => {
				expect(instance.data).toEqual({});
			});
		});

		describe('.isOperational', () => {
			it('is set to false', () => {
				expect(instance.isOperational).toStrictEqual(false);
			});
		});

		describe('.message', () => {
			it('is set to a default value', () => {
				expect(instance.message).toStrictEqual('An error occurred');
			});
		});

		describe('.name', () => {
			it('is set to "BaseError"', () => {
				expect(instance.name).toStrictEqual('BaseError');
			});
		});
	});

	describe('new BaseError(message)', () => {
		let instance;

		beforeEach(() => {
			instance = new BaseError('mock message');
		});

		describe('.message', () => {
			it('is set to the passed in message parameter', () => {
				expect(instance.message).toStrictEqual('mock message');
			});
		});
	});

	describe('new BaseError(data)', () => {
		let instance;
		let rootCauseErrorInstance;

		beforeEach(() => {
			jest.spyOn(BaseError, 'normalizeErrorCode').mockReturnValue('MOCK_CODE');

			rootCauseErrorInstance = new Error('mock root cause error message');

			instance = new BaseError({
				message: 'mock message',
				code: 'mock_code',
				extra: 'mock extra data',
				cause: rootCauseErrorInstance
			});
		});

		it('normalizes the passed in error code', () => {
			expect(BaseError.normalizeErrorCode).toHaveBeenCalledWith('mock_code');
		});

		describe('.code', () => {
			it('is set to the normalized error code', () => {
				expect(instance.code).toStrictEqual('MOCK_CODE');
			});
		});

		describe('.data', () => {
			it('is set to an object containing the extra keys in `data`', () => {
				expect(instance.data).toEqual({
					extra: 'mock extra data'
				});
			});
		});

		describe('.isOperational', () => {
			it('is set to false', () => {
				expect(instance.isOperational).toStrictEqual(false);
			});
		});

		describe('.message', () => {
			it('is set to the data.message property', () => {
				expect(instance.message).toStrictEqual('mock message');
			});
		});

		describe('.name', () => {
			it('is set to "BaseError"', () => {
				expect(instance.name).toStrictEqual('BaseError');
			});
		});
	});

	describe('new BaseError(message, data)', () => {
		let instance;

		beforeEach(() => {
			jest.spyOn(BaseError, 'normalizeErrorCode').mockReturnValue('MOCK_CODE');

			instance = new BaseError('mock message', {
				code: 'mock_code'
			});
		});

		it('normalizes the passed in error code', () => {
			expect(BaseError.normalizeErrorCode).toHaveBeenCalledWith('mock_code');
		});

		describe('.code', () => {
			it('is set to the normalized error code', () => {
				expect(instance.code).toStrictEqual('MOCK_CODE');
			});
		});

		describe('.message', () => {
			it('is set to the message parameter', () => {
				expect(instance.message).toStrictEqual('mock message');
			});
		});
	});

	describe('isErrorMarkedAsOperational(error)', () => {
		describe('when called with a BaseError instance', () => {
			it('returns `false`', () => {
				expect(
					BaseError.isErrorMarkedAsOperational(new BaseError('mock message'))
				).toStrictEqual(false);
			});
		});

		describe('when called with an OperationalError instance', () => {
			it('returns `true`', () => {
				expect(
					BaseError.isErrorMarkedAsOperational(
						new OperationalError('mock message')
					)
				).toStrictEqual(true);
			});
		});

		describe('when called with an Error instance', () => {
			it('returns `false`', () => {
				expect(
					BaseError.isErrorMarkedAsOperational(new Error('mock message'))
				).toStrictEqual(false);
			});
		});

		describe('when called with an Error instance that has a manually added `isOperational` property', () => {
			it('returns `true`', () => {
				const error = new Error('mock message');
				error.isOperational = true;
				expect(BaseError.isErrorMarkedAsOperational(error)).toStrictEqual(true);
			});
		});
	});

	describe('.normalizeErrorCode(code)', () => {
		it('uppercases and normalizes spacing in the code', () => {
			expect(BaseError.normalizeErrorCode(' ABC-123_foo   bar ')).toStrictEqual(
				'ABC_123_FOO_BAR'
			);
		});
	});

	describe('.default', () => {
		it('aliases the module exports', () => {
			expect(BaseError.default).toStrictEqual(BaseError);
		});
	});
});
