const OperationalError = require('../../../lib/operational-error');
const DataStoreError = require('../../../lib/data-store-error');

describe('@dotcom-reliability-kit/errors/lib/data-store-error', () => {
	afterEach(() => {
		jest.restoreAllMocks();
	});

	it('exports a class', () => {
		expect(DataStoreError).toBeInstanceOf(Function);
		expect(() => {
			DataStoreError();
		}).toThrow(/class constructor/i);
	});

	it('extends the OperationalError class', () => {
		expect(DataStoreError.prototype).toBeInstanceOf(OperationalError);
	});

	describe('new DataStoreError()', () => {
		let instance;

		beforeEach(() => {
			instance = new DataStoreError();
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

		describe('.message', () => {
			it('is set to a default value', () => {
				expect(instance.message).toStrictEqual('An operational error occurred');
			});
		});

		describe('.name', () => {
			it('is set to "DataStoreError"', () => {
				expect(instance.name).toStrictEqual('DataStoreError');
			});
		});
	});

	describe('new DataStoreError(message)', () => {
		let instance;

		beforeEach(() => {
			instance = new DataStoreError('mock message');
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

		describe('.message', () => {
			it('is set to the passed in message parameter', () => {
				expect(instance.message).toStrictEqual('mock message');
			});
		});

		describe('.name', () => {
			it('is set to "DataStoreError"', () => {
				expect(instance.name).toStrictEqual('DataStoreError');
			});
		});
	});

	describe('new DataStoreError(data)', () => {
		let instance;

		beforeEach(() => {
			jest
				.spyOn(OperationalError, 'normalizeErrorCode')
				.mockReturnValue('MOCK_CODE');
			instance = new DataStoreError({
				message: 'mock message',
				code: 'mock_code',
				extra: 'mock extra data'
			});
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

		describe('.message', () => {
			it('is set to the data.message property', () => {
				expect(instance.message).toStrictEqual('mock message');
			});
		});

		describe('.name', () => {
			it('is set to "DataStoreError"', () => {
				expect(instance.name).toStrictEqual('DataStoreError');
			});
		});
	});

	describe('new DataStoreError(message, data)', () => {
		let instance;

		beforeEach(() => {
			jest
				.spyOn(OperationalError, 'normalizeErrorCode')
				.mockReturnValue('MOCK_CODE');
			instance = new DataStoreError('mock message', {
				code: 'mock_code'
			});
		});

		describe('.code', () => {
			it('is set to the normalized error code', () => {
				expect(instance.code).toStrictEqual('MOCK_CODE');
			});
		});

		describe('.message', () => {
			it('is set to the data.message property', () => {
				expect(instance.message).toStrictEqual('mock message');
			});
		});
	});

	describe('.default', () => {
		it('aliases the module exports', () => {
			expect(DataStoreError.default).toStrictEqual(DataStoreError);
		});
	});
});
