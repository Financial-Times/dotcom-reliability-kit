import assert from 'node:assert/strict';
import { afterEach, beforeEach, describe, it, mock } from 'node:test';
import HttpError from '../../../lib/http-error.js';

mock.module('node:http', {
	namedExports: {
		STATUS_CODES: {
			400: 'mock 400 message',
			456: 'mock 456 message',
			500: 'mock 500 message'
		}
	}
});

const { default: UserInputError } = await import('../../../lib/user-input-error.js');

describe('@dotcom-reliability-kit/errors/lib/user-input-error', () => {
	afterEach(() => {
		mock.restoreAll();
	});

	it('exports a class', () => {
		assert.ok(UserInputError instanceof Function);
		assert.throws(() => UserInputError(), /class constructor/i);
	});

	it('extends the HttpError class', () => {
		assert.ok(UserInputError.prototype instanceof HttpError);
	});

	describe('new UserInputError()', () => {
		let instance;

		beforeEach(() => {
			mock.method(HttpError, 'getMessageForStatusCode', () => 'mock status message');
			instance = new UserInputError();
		});

		describe('.code', () => {
			it('is set to "HTTP_400"', () => {
				assert.strictEqual(instance.code, 'HTTP_400');
			});
		});

		describe('.data', () => {
			it('is set to an empty object', () => {
				assert.deepStrictEqual(instance.data, {});
			});
		});

		describe('.message', () => {
			it('is set to the status message for the default 400 code', () => {
				assert.strictEqual(instance.message, 'mock status message');
			});
		});

		describe('.name', () => {
			it('is set to "UserInputError"', () => {
				assert.strictEqual(instance.name, 'UserInputError');
			});
		});

		describe('.statusCode', () => {
			it('is set to 400', () => {
				assert.strictEqual(instance.statusCode, 400);
			});
		});

		describe('.status', () => {
			it('aliases the `statusCode` property', () => {
				instance.statusCode = 'mock status';
				assert.strictEqual(instance.status, 'mock status');
			});
		});

		describe('.statusMessage', () => {
			it('is set to the status message for the default 400 code', () => {
				assert.strictEqual(instance.statusMessage, 'mock status message');
			});
		});
	});

	describe('new UserInputError(message)', () => {
		let instance;

		beforeEach(() => {
			mock.method(HttpError, 'getMessageForStatusCode', () => 'mock status message');
			instance = new UserInputError('mock message');
		});

		describe('.code', () => {
			it('is set to "HTTP_400"', () => {
				assert.strictEqual(instance.code, 'HTTP_400');
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
			it('is set to "UserInputError"', () => {
				assert.strictEqual(instance.name, 'UserInputError');
			});
		});

		describe('.statusCode', () => {
			it('is set to 400', () => {
				assert.strictEqual(instance.statusCode, 400);
			});
		});

		describe('.status', () => {
			it('aliases the `statusCode` property', () => {
				instance.statusCode = 'mock status';
				assert.strictEqual(instance.status, 'mock status');
			});
		});

		describe('.statusMessage', () => {
			it('is set to the status message for the default 400 code', () => {
				assert.strictEqual(instance.statusMessage, 'mock status message');
			});
		});
	});

	describe('new UserInputError(statusCode)', () => {
		let instance;

		beforeEach(() => {
			mock.method(HttpError, 'normalizeErrorStatusCode', () => 456);
			mock.method(HttpError, 'getMessageForStatusCode', () => 'mock status message');
			instance = new UserInputError(456);
		});

		describe('.code', () => {
			it('is set to a code representing the normalized status code', () => {
				assert.strictEqual(instance.code, 'HTTP_456');
			});
		});

		describe('.data', () => {
			it('is set to an empty object', () => {
				assert.deepStrictEqual(instance.data, {});
			});
		});

		describe('.message', () => {
			it('is set to the status message for the normalized status code', () => {
				assert.strictEqual(instance.message, 'mock status message');
			});
		});

		describe('.name', () => {
			it('is set to "UserInputError"', () => {
				assert.strictEqual(instance.name, 'UserInputError');
			});
		});

		describe('.statusCode', () => {
			it('is set to the normalized status code', () => {
				assert.strictEqual(instance.statusCode, 456);
			});
		});

		describe('.status', () => {
			it('aliases the `statusCode` property', () => {
				instance.statusCode = 'mock status';
				assert.strictEqual(instance.status, 'mock status');
			});
		});

		describe('.statusMessage', () => {
			it('is set to the status message for the normalized status code', () => {
				assert.strictEqual(instance.statusMessage, 'mock status message');
			});
		});
	});

	describe('new UserInputError(data)', () => {
		let instance;

		beforeEach(() => {
			mock.method(HttpError, 'normalizeErrorCode', () => 'MOCK_CODE');
			mock.method(HttpError, 'normalizeErrorStatusCode', () => 456);
			mock.method(HttpError, 'getMessageForStatusCode', () => 'mock status message');
			instance = new UserInputError({
				message: 'mock message',
				code: 'mock_code',
				statusCode: 567,
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
			it('is set to "UserInputError"', () => {
				assert.strictEqual(instance.name, 'UserInputError');
			});
		});

		describe('.statusCode', () => {
			it('is set to the normalized status code', () => {
				assert.strictEqual(instance.statusCode, 456);
			});
		});

		describe('.status', () => {
			it('aliases the `statusCode` property', () => {
				instance.statusCode = 'mock status';
				assert.strictEqual(instance.status, 'mock status');
			});
		});

		describe('.statusMessage', () => {
			it('is set to the status message for the passed in status code', () => {
				assert.strictEqual(instance.statusMessage, 'mock status message');
			});
		});
	});

	describe('new UserInputError(message, data)', () => {
		let instance;

		beforeEach(() => {
			mock.method(HttpError, 'normalizeErrorCode', () => 'MOCK_CODE');
			mock.method(HttpError, 'normalizeErrorStatusCode', () => 456);
			instance = new UserInputError('mock message', {
				code: 'mock_code',
				statusCode: 567
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

		describe('.statusCode', () => {
			it('is set to the normalized status code', () => {
				assert.strictEqual(instance.statusCode, 456);
			});
		});
	});

	describe('new UserInputError(message, data)', () => {
		let instance;

		beforeEach(() => {
			mock.method(HttpError, 'normalizeErrorCode', () => 'MOCK_CODE');
			mock.method(HttpError, 'normalizeErrorStatusCode', () => 456);
			instance = new UserInputError(567, {
				message: 'mock message',
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

		describe('.statusCode', () => {
			it('is set to the normalized status code', () => {
				assert.strictEqual(instance.statusCode, 456);
			});
		});
	});
});
