const OperationalError = require('../../lib/operational-error');

describe('@dotcom-reliability-kit/errors/lib/operational-error', () => {
	afterEach(() => {
		jest.restoreAllMocks();
	});

	it('exports a class', () => {
		expect(OperationalError).toBeInstanceOf(Function);
		expect(() => {
			OperationalError();
		}).toThrow(/class constructor/i);
	});

	it('extends the global Error class', () => {
		expect(OperationalError.prototype).toBeInstanceOf(Error);
	});

	describe('new OperationalError()', () => {
		let instance;

		beforeEach(() => {
			instance = new OperationalError();
		});

		describe('.code', () => {
			it('is set to "UNKNOWN"', () => {
				expect(instance.code).toStrictEqual('UNKNOWN');
			});
		});

		describe('.isOperational', () => {
			it('is set to true', () => {
				expect(instance.isOperational).toStrictEqual(true);
			});
		});

		describe('.message', () => {
			it('is set to a default value', () => {
				expect(instance.message).toStrictEqual('An operational error occurred');
			});
		});

		describe('.name', () => {
			it('is set to "OperationalError"', () => {
				expect(instance.name).toStrictEqual('OperationalError');
			});
		});
	});

	describe('new OperationalError(message)', () => {
		let instance;

		beforeEach(() => {
			instance = new OperationalError('mock message');
		});

		describe('.code', () => {
			it('is set to "UNKNOWN"', () => {
				expect(instance.code).toStrictEqual('UNKNOWN');
			});
		});

		describe('.isOperational', () => {
			it('is set to true', () => {
				expect(instance.isOperational).toStrictEqual(true);
			});
		});

		describe('.message', () => {
			it('is set to the passed in message parameter', () => {
				expect(instance.message).toStrictEqual('mock message');
			});
		});

		describe('.name', () => {
			it('is set to "OperationalError"', () => {
				expect(instance.name).toStrictEqual('OperationalError');
			});
		});
	});

	describe('new OperationalError(data)', () => {
		let instance;

		beforeEach(() => {
			jest
				.spyOn(OperationalError, 'normalizeErrorCode')
				.mockReturnValue('MOCK_CODE');
			instance = new OperationalError({
				message: 'mock message',
				code: 'mock_code'
			});
		});

		it('normalizes the passed in error code', () => {
			expect(OperationalError.normalizeErrorCode).toBeCalledWith('mock_code');
		});

		describe('.code', () => {
			it('is set to the normalized error code', () => {
				expect(instance.code).toStrictEqual('MOCK_CODE');
			});
		});

		describe('.isOperational', () => {
			it('is set to true', () => {
				expect(instance.isOperational).toStrictEqual(true);
			});
		});

		describe('.message', () => {
			it('is set to the data.message property', () => {
				expect(instance.message).toStrictEqual('mock message');
			});
		});

		describe('.name', () => {
			it('is set to "OperationalError"', () => {
				expect(instance.name).toStrictEqual('OperationalError');
			});
		});
	});

	describe('isErrorMarkedAsOperational(error)', () => {
		describe('when called with an OperationalError instance', () => {
			it('returns `true`', () => {
				expect(
					OperationalError.isErrorMarkedAsOperational(
						new OperationalError('mock message')
					)
				).toStrictEqual(true);
			});
		});

		describe('when called with an Error instance', () => {
			it('returns `false`', () => {
				expect(
					OperationalError.isErrorMarkedAsOperational(new Error('mock message'))
				).toStrictEqual(false);
			});
		});

		describe('when called with an Error instance that has a manually added `isOperational` property', () => {
			it('returns `true`', () => {
				const error = new Error('mock message');
				error.isOperational = true;
				expect(
					OperationalError.isErrorMarkedAsOperational(error)
				).toStrictEqual(true);
			});
		});
	});

	describe('.normalizeErrorCode(code)', () => {
		it('uppercases and normalizes spacing in the code', () => {
			expect(
				OperationalError.normalizeErrorCode(' ABC-123_foo   bar ')
			).toStrictEqual('ABC_123_FOO_BAR');
		});
	});
});
