const { afterEach, beforeEach, describe, it, mock } = require('node:test');
const assert = require('node:assert/strict');

const OperationalError = require('../../../lib/operational-error');
const DataStoreError = require('../../../lib/data-store-error');

describe('@dotcom-reliability-kit/errors/lib/data-store-error', () => {
	afterEach(() => {
		mock.restoreAll();
	});

	it('exports a class', () => {
		assert.ok(DataStoreError instanceof Function);
		assert.throws(() => DataStoreError(), /class constructor/i);
	});

	it('extends the OperationalError class', () => {
		assert.ok(DataStoreError.prototype instanceof OperationalError);
	});

	describe('new DataStoreError()', () => {
		let instance;

		beforeEach(() => {
			instance = new DataStoreError();
		});

		describe('.code', () => {
			it('is set to "UNKNOWN"', () => {
				assert.strictEqual(instance.code, 'UNKNOWN');
			});
		});

		describe('.data', () => {
			it('is set to an empty object', () => {
				assert.deepStrictEqual(instance.data, {});
			});
		});

		describe('.message', () => {
			it('is set to a default value', () => {
				assert.strictEqual(instance.message, 'An operational error occurred');
			});
		});

		describe('.name', () => {
			it('is set to "DataStoreError"', () => {
				assert.strictEqual(instance.name, 'DataStoreError');
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
				assert.strictEqual(instance.code, 'UNKNOWN');
			});
		});

		describe('.data', () => {
			it('is set to an empty object', () => {
				assert.deepStrictEqual(instance.data, {});
			});
		});

		describe('.message', () => {
			it('is set to the passed in message parameter', () => {
				assert.strictEqual(instance.message, 'mock message');
			});
		});

		describe('.name', () => {
			it('is set to "DataStoreError"', () => {
				assert.strictEqual(instance.name, 'DataStoreError');
			});
		});
	});

	describe('new DataStoreError(data)', () => {
		let instance;

		beforeEach(() => {
			mock.method(OperationalError, 'normalizeErrorCode', () => 'MOCK_CODE');
			instance = new DataStoreError({
				message: 'mock message',
				code: 'mock_code',
				extra: 'mock extra data'
			});
		});

		describe('.code', () => {
			it('is set to the normalized error code', () => {
				assert.strictEqual(instance.code, 'MOCK_CODE');
			});
		});

		describe('.data', () => {
			it('is set to an object containing the extra keys in `data`', () => {
				assert.deepStrictEqual(instance.data, {
					extra: 'mock extra data'
				});
			});
		});

		describe('.message', () => {
			it('is set to the data.message property', () => {
				assert.strictEqual(instance.message, 'mock message');
			});
		});

		describe('.name', () => {
			it('is set to "DataStoreError"', () => {
				assert.strictEqual(instance.name, 'DataStoreError');
			});
		});
	});

	describe('new DataStoreError(message, data)', () => {
		let instance;

		beforeEach(() => {
			mock.method(OperationalError, 'normalizeErrorCode', () => 'MOCK_CODE');
			instance = new DataStoreError('mock message', {
				code: 'mock_code'
			});
		});

		describe('.code', () => {
			it('is set to the normalized error code', () => {
				assert.strictEqual(instance.code, 'MOCK_CODE');
			});
		});

		describe('.message', () => {
			it('is set to the data.message property', () => {
				assert.strictEqual(instance.message, 'mock message');
			});
		});
	});

	describe('.default', () => {
		it('aliases the module exports', () => {
			assert.strictEqual(DataStoreError.default, DataStoreError);
		});
	});
});
