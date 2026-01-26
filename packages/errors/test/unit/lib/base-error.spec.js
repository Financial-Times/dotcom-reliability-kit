const { afterEach, beforeEach, describe, it, mock } = require('node:test');
const assert = require('node:assert/strict');

const BaseError = require('../../../lib/base-error');
class MockOperationalError {
	isOperational = true;
}

describe('@dotcom-reliability-kit/errors/lib/base-error', () => {
	afterEach(() => {
		mock.restoreAll();
	});

	it('exports a class', () => {
		assert.ok(BaseError instanceof Function);
		assert.throws(() => BaseError(), /class constructor/i);
	});

	it('extends the global Error class', () => {
		assert.ok(BaseError.prototype instanceof Error);
	});

	describe('new BaseError()', () => {
		let instance;

		beforeEach(() => {
			instance = new BaseError();
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

		describe('.isOperational', () => {
			it('is set to false', () => {
				assert.strictEqual(instance.isOperational, false);
			});
		});

		describe('.message', () => {
			it('is set to a default value', () => {
				assert.strictEqual(instance.message, 'An error occurred');
			});
		});

		describe('.name', () => {
			it('is set to "BaseError"', () => {
				assert.strictEqual(instance.name, 'BaseError');
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
				assert.strictEqual(instance.message, 'mock message');
			});
		});
	});

	describe('new BaseError(data)', () => {
		let instance;
		let rootCauseErrorInstance;

		beforeEach(() => {
			mock.method(BaseError, 'normalizeErrorCode', () => 'MOCK_CODE');

			rootCauseErrorInstance = new Error('mock root cause error message');

			instance = new BaseError({
				message: 'mock message',
				code: 'mock_code',
				extra: 'mock extra data',
				cause: rootCauseErrorInstance
			});
		});

		it('normalizes the passed in error code', () => {
			assert.strictEqual(BaseError.normalizeErrorCode.mock.callCount(), 1);
			assert.deepStrictEqual(BaseError.normalizeErrorCode.mock.calls[0].arguments, [
				'mock_code'
			]);
		});

		describe('.code', () => {
			it('is set to the normalized error code', () => {
				assert.strictEqual(instance.code, 'MOCK_CODE');
			});
		});

		describe('.data', () => {
			it('is set to an object containing the extra keys in `data`', () => {
				assert.deepStrictEqual(instance.data, { extra: 'mock extra data' });
			});
		});

		describe('.isOperational', () => {
			it('is set to false', () => {
				assert.strictEqual(instance.isOperational, false);
			});
		});

		describe('.message', () => {
			it('is set to the data.message property', () => {
				assert.strictEqual(instance.message, 'mock message');
			});
		});

		describe('.name', () => {
			it('is set to "BaseError"', () => {
				assert.strictEqual(instance.name, 'BaseError');
			});
		});
	});

	describe('new BaseError(message, data)', () => {
		let instance;

		beforeEach(() => {
			mock.method(BaseError, 'normalizeErrorCode', () => 'MOCK_CODE');

			instance = new BaseError('mock message', {
				code: 'mock_code'
			});
		});

		it('normalizes the passed in error code', () => {
			assert.strictEqual(BaseError.normalizeErrorCode.mock.callCount(), 1);
			assert.deepStrictEqual(BaseError.normalizeErrorCode.mock.calls[0].arguments, [
				'mock_code'
			]);
		});

		describe('.code', () => {
			it('is set to the normalized error code', () => {
				assert.strictEqual(instance.code, 'MOCK_CODE');
			});
		});

		describe('.message', () => {
			it('is set to the message parameter', () => {
				assert.strictEqual(instance.message, 'mock message');
			});
		});
	});

	describe('isErrorMarkedAsOperational(error)', () => {
		describe('when called with a BaseError instance', () => {
			it('returns `false`', () => {
				assert.strictEqual(
					BaseError.isErrorMarkedAsOperational(new BaseError('mock message')),
					false
				);
			});
		});

		describe('when called with an OperationalError instance', () => {
			it('returns `true`', () => {
				assert.strictEqual(
					BaseError.isErrorMarkedAsOperational(new MockOperationalError('mock message')),
					true
				);
			});
		});

		describe('when called with an Error instance', () => {
			it('returns `false`', () => {
				assert.strictEqual(
					BaseError.isErrorMarkedAsOperational(new Error('mock message')),
					false
				);
			});
		});

		describe('when called with an Error instance that has a manually added `isOperational` property', () => {
			it('returns `true`', () => {
				const error = new Error('mock message');
				error.isOperational = true;
				assert.strictEqual(BaseError.isErrorMarkedAsOperational(error), true);
			});
		});
	});

	describe('.normalizeErrorCode(code)', () => {
		it('uppercases and normalizes spacing in the code', () => {
			assert.strictEqual(
				BaseError.normalizeErrorCode(' ABC-123_foo   bar '),
				'ABC_123_FOO_BAR'
			);
		});
	});

	describe('.default', () => {
		it('aliases the module exports', () => {
			assert.strictEqual(BaseError.default, BaseError);
		});
	});
});
