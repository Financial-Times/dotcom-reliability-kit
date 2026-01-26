const { afterEach, beforeEach, describe, it, mock } = require('node:test');
const assert = require('node:assert/strict');

const BaseError = require('../../../lib/base-error');
const OperationalError = require('../../../lib/operational-error');

describe('@dotcom-reliability-kit/errors/lib/operational-error', () => {
	afterEach(() => {
		mock.restoreAll();
	});

	it('exports a class', () => {
		assert.ok(OperationalError instanceof Function);
		assert.throws(() => OperationalError(), /class constructor/i);
	});

	it('extends the BaseError class', () => {
		assert.ok(OperationalError.prototype instanceof BaseError);
	});

	describe('new OperationalError()', () => {
		let instance;

		beforeEach(() => {
			instance = new OperationalError();
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
			it('is set to true', () => {
				assert.strictEqual(instance.isOperational, true);
			});
		});

		describe('.message', () => {
			it('is set to a default value', () => {
				assert.strictEqual(instance.message, 'An operational error occurred');
			});
		});

		describe('.name', () => {
			it('is set to "OperationalError"', () => {
				assert.strictEqual(instance.name, 'OperationalError');
			});
		});

		describe('.relatesToSystems', () => {
			it('is set to an empty array', () => {
				assert.deepStrictEqual(instance.relatesToSystems, []);
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
				assert.strictEqual(instance.code, 'UNKNOWN');
			});
		});

		describe('.data', () => {
			it('is set to an empty object', () => {
				assert.deepStrictEqual(instance.data, {});
			});
		});

		describe('.isOperational', () => {
			it('is set to true', () => {
				assert.strictEqual(instance.isOperational, true);
			});
		});

		describe('.message', () => {
			it('is set to the passed in message parameter', () => {
				assert.strictEqual(instance.message, 'mock message');
			});
		});

		describe('.name', () => {
			it('is set to "OperationalError"', () => {
				assert.strictEqual(instance.name, 'OperationalError');
			});
		});

		describe('.relatesToSystems', () => {
			it('is set to an empty array', () => {
				assert.deepStrictEqual(instance.relatesToSystems, []);
			});
		});
	});

	describe('new OperationalError(data)', () => {
		let instance;
		let rootCauseErrorInstance;

		beforeEach(() => {
			mock.method(BaseError, 'normalizeErrorCode', () => 'MOCK_CODE');

			rootCauseErrorInstance = new Error('mock root cause error message');

			instance = new OperationalError({
				message: 'mock message',
				code: 'mock_code',
				extra: 'mock extra data',
				relatesToSystems: ['system-one', 'system-two'],
				cause: rootCauseErrorInstance
			});
		});

		it('normalizes the passed in error code', () => {
			assert.strictEqual(OperationalError.normalizeErrorCode.mock.callCount(), 1);
			assert.deepStrictEqual(OperationalError.normalizeErrorCode.mock.calls[0].arguments, [
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
				assert.deepStrictEqual(instance.data, {
					extra: 'mock extra data'
				});
			});
		});

		describe('.isOperational', () => {
			it('is set to true', () => {
				assert.strictEqual(instance.isOperational, true);
			});
		});

		describe('.message', () => {
			it('is set to the data.message property', () => {
				assert.strictEqual(instance.message, 'mock message');
			});
		});

		describe('.name', () => {
			it('is set to "OperationalError"', () => {
				assert.strictEqual(instance.name, 'OperationalError');
			});
		});

		describe('.relatesToSystems', () => {
			it('is an array', () => {
				assert.deepStrictEqual(instance.relatesToSystems, ['system-one', 'system-two']);
			});

			it('will store a string as an array', () => {
				const singleSystemError = new OperationalError({
					relatesToSystems: 'system-one'
				});
				assert.deepStrictEqual(singleSystemError.relatesToSystems, ['system-one']);
			});
		});

		describe('.cause', () => {
			it('is set to the root cause error instance', () => {
				assert.deepStrictEqual(instance.cause, rootCauseErrorInstance);
			});
		});
	});

	describe('new OperationalError(message, data)', () => {
		let instance;

		beforeEach(() => {
			mock.method(BaseError, 'normalizeErrorCode', () => 'MOCK_CODE');

			instance = new OperationalError('mock message', {
				code: 'mock_code'
			});
		});

		it('normalizes the passed in error code', () => {
			assert.strictEqual(OperationalError.normalizeErrorCode.mock.callCount(), 1);
			assert.deepStrictEqual(OperationalError.normalizeErrorCode.mock.calls[0].arguments, [
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
		describe('when called with an OperationalError instance', () => {
			it('returns `true`', () => {
				assert.strictEqual(
					OperationalError.isErrorMarkedAsOperational(
						new OperationalError('mock message')
					),
					true
				);
			});
		});

		describe('when called with an Error instance', () => {
			it('returns `false`', () => {
				assert.strictEqual(
					OperationalError.isErrorMarkedAsOperational(new Error('mock message')),
					false
				);
			});
		});

		describe('when called with an Error instance that has a manually added `isOperational` property', () => {
			it('returns `true`', () => {
				const error = new Error('mock message');
				error.isOperational = true;
				assert.strictEqual(OperationalError.isErrorMarkedAsOperational(error), true);
			});
		});
	});

	describe('.normalizeErrorCode(code)', () => {
		it('uppercases and normalizes spacing in the code', () => {
			assert.strictEqual(
				OperationalError.normalizeErrorCode(' ABC-123_foo   bar '),
				'ABC_123_FOO_BAR'
			);
		});
	});

	describe('.default', () => {
		it('aliases the module exports', () => {
			assert.strictEqual(OperationalError.default, OperationalError);
		});
	});
});
