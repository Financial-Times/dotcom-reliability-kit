const { afterEach, beforeEach, describe, it, mock } = require('node:test');
const assert = require('node:assert/strict');

mock.module('node:http', {
	namedExports: {
		STATUS_CODES: {
			400: 'mock 400 message',
			456: 'mock 456 message',
			500: 'mock 500 message'
		}
	}
});

const BaseError = require('../../../lib/base-error');
const HttpError = require('../../../lib/http-error');
const OperationalError = require('../../../lib/operational-error');

describe('@dotcom-reliability-kit/errors/lib/http-error', () => {
	afterEach(() => {
		mock.restoreAll();
	});

	it('exports a class', () => {
		assert.ok(HttpError instanceof Function);
		assert.throws(() => HttpError(), /class constructor/i);
	});

	it('extends the OperationalError class', () => {
		assert.ok(HttpError.prototype instanceof OperationalError);
	});

	describe('new HttpError()', () => {
		let instance;

		beforeEach(() => {
			mock.method(HttpError, 'getMessageForStatusCode', () => 'mock status message');
			instance = new HttpError();
		});

		it('gets the status message for the 500 code', () => {
			assert.strictEqual(HttpError.getMessageForStatusCode.mock.callCount(), 1);
			assert.deepStrictEqual(
				HttpError.getMessageForStatusCode.mock.calls[0].arguments,
				[500]
			);
		});

		describe('.code', () => {
			it('is set to "HTTP_500"', () => {
				assert.strictEqual(instance.code, 'HTTP_500');
			});
		});

		describe('.data', () => {
			it('is set to an empty object', () => {
				assert.deepStrictEqual(instance.data, {});
			});
		});

		describe('.message', () => {
			it('is set to the status message for the default 500 code', () => {
				assert.strictEqual(instance.message, 'mock status message');
			});
		});

		describe('.name', () => {
			it('is set to "HttpError"', () => {
				assert.strictEqual(instance.name, 'HttpError');
			});
		});

		describe('.statusCode', () => {
			it('is set to 500', () => {
				assert.strictEqual(instance.statusCode, 500);
			});
		});

		describe('.status', () => {
			it('aliases the `statusCode` property', () => {
				instance.statusCode = 'mock status';
				assert.strictEqual(instance.status, 'mock status');
			});
		});

		describe('.statusMessage', () => {
			it('is set to the status message for the default 500 code', () => {
				assert.strictEqual(instance.statusMessage, 'mock status message');
			});
		});
	});

	describe('new HttpError(message)', () => {
		let instance;

		beforeEach(() => {
			mock.method(HttpError, 'getMessageForStatusCode', () => 'mock status message');
			instance = new HttpError('mock message');
		});

		it('gets the status message for the 500 code', () => {
			assert.strictEqual(HttpError.getMessageForStatusCode.mock.callCount(), 1);
			assert.deepStrictEqual(
				HttpError.getMessageForStatusCode.mock.calls[0].arguments,
				[500]
			);
		});

		describe('.code', () => {
			it('is set to "HTTP_500"', () => {
				assert.strictEqual(instance.code, 'HTTP_500');
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
			it('is set to "HttpError"', () => {
				assert.strictEqual(instance.name, 'HttpError');
			});
		});

		describe('.statusCode', () => {
			it('is set to 500', () => {
				assert.strictEqual(instance.statusCode, 500);
			});
		});

		describe('.status', () => {
			it('aliases the `statusCode` property', () => {
				instance.statusCode = 'mock status';
				assert.strictEqual(instance.status, 'mock status');
			});
		});

		describe('.statusMessage', () => {
			it('is set to the status message for the default 500 code', () => {
				assert.strictEqual(instance.statusMessage, 'mock status message');
			});
		});
	});

	describe('new HttpError(statusCode)', () => {
		let instance;

		beforeEach(() => {
			mock.method(HttpError, 'normalizeErrorStatusCode', () => 456);
			mock.method(HttpError, 'getMessageForStatusCode', () => 'mock status message');
			instance = new HttpError(567);
		});

		it('normalizes the passed in status code', () => {
			assert.strictEqual(HttpError.normalizeErrorStatusCode.mock.callCount(), 1);
			assert.deepStrictEqual(
				HttpError.normalizeErrorStatusCode.mock.calls[0].arguments,
				[567]
			);
		});

		it('gets the status message for the normalized code', () => {
			assert.strictEqual(HttpError.getMessageForStatusCode.mock.callCount(), 1);
			assert.deepStrictEqual(
				HttpError.getMessageForStatusCode.mock.calls[0].arguments,
				[456]
			);
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
			it('is set to "HttpError"', () => {
				assert.strictEqual(instance.name, 'HttpError');
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

	describe('new HttpError(data)', () => {
		let instance;

		beforeEach(() => {
			mock.method(BaseError, 'normalizeErrorCode', () => 'MOCK_CODE');
			mock.method(HttpError, 'normalizeErrorStatusCode', () => 456);
			mock.method(HttpError, 'getMessageForStatusCode', () => 'mock status message');
			instance = new HttpError({
				message: 'mock message',
				code: 'mock_code',
				statusCode: 567,
				extra: 'mock extra data'
			});
		});

		it('normalizes the passed in error code', () => {
			assert.strictEqual(HttpError.normalizeErrorCode.mock.callCount(), 1);
			assert.deepStrictEqual(HttpError.normalizeErrorCode.mock.calls[0].arguments, [
				'mock_code'
			]);
		});

		it('normalizes the passed in status code', () => {
			assert.strictEqual(HttpError.normalizeErrorStatusCode.mock.callCount(), 1);
			assert.deepStrictEqual(
				HttpError.normalizeErrorStatusCode.mock.calls[0].arguments,
				[567]
			);
		});

		it('gets the status message for the normalized code', () => {
			assert.strictEqual(HttpError.getMessageForStatusCode.mock.callCount(), 1);
			assert.deepStrictEqual(
				HttpError.getMessageForStatusCode.mock.calls[0].arguments,
				[456]
			);
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
			it('is set to "HttpError"', () => {
				assert.strictEqual(instance.name, 'HttpError');
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

	describe('new HttpError(message, data)', () => {
		let instance;

		beforeEach(() => {
			mock.method(BaseError, 'normalizeErrorCode', () => 'MOCK_CODE');
			mock.method(HttpError, 'normalizeErrorStatusCode', () => 456);
			instance = new HttpError('mock message', {
				code: 'mock_code',
				statusCode: 567
			});
		});

		it('normalizes the passed in error code', () => {
			assert.strictEqual(HttpError.normalizeErrorCode.mock.callCount(), 1);
			assert.deepStrictEqual(HttpError.normalizeErrorCode.mock.calls[0].arguments, [
				'mock_code'
			]);
		});

		it('normalizes the passed in status code', () => {
			assert.strictEqual(HttpError.normalizeErrorStatusCode.mock.callCount(), 1);
			assert.deepStrictEqual(
				HttpError.normalizeErrorStatusCode.mock.calls[0].arguments,
				[567]
			);
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

	describe('new HttpError(statusCode, data)', () => {
		let instance;

		beforeEach(() => {
			mock.method(BaseError, 'normalizeErrorCode', () => 'MOCK_CODE');
			mock.method(HttpError, 'normalizeErrorStatusCode', () => 456);
			instance = new HttpError(567, {
				message: 'mock message',
				code: 'mock_code'
			});
		});

		it('normalizes the passed in error code', () => {
			assert.strictEqual(HttpError.normalizeErrorCode.mock.callCount(), 1);
			assert.deepStrictEqual(HttpError.normalizeErrorCode.mock.calls[0].arguments, [
				'mock_code'
			]);
		});

		it('normalizes the passed in status code', () => {
			assert.strictEqual(HttpError.normalizeErrorStatusCode.mock.callCount(), 1);
			assert.deepStrictEqual(
				HttpError.normalizeErrorStatusCode.mock.calls[0].arguments,
				[567]
			);
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

	describe('.normalizeErrorStatusCode(statusCode)', () => {
		describe('when the status code is a valid error code', () => {
			it('returns the passed in status code', () => {
				assert.strictEqual(HttpError.normalizeErrorStatusCode(456), 456);
			});
		});

		describe('when the status code is less than 400', () => {
			it('returns 500', () => {
				assert.strictEqual(HttpError.normalizeErrorStatusCode(345), 500);
			});
		});

		describe('when the status code is greater than 500', () => {
			it('returns 500', () => {
				assert.strictEqual(HttpError.normalizeErrorStatusCode(678), 500);
			});
		});

		describe('when the status code is a floating point number', () => {
			it('returns the floored number', () => {
				assert.strictEqual(HttpError.normalizeErrorStatusCode(456.8), 456);
			});
		});
	});

	describe('.getMessageForStatusCode(statusCode)', () => {
		describe('when the status code is a valid HTTP status code', () => {
			it('returns the matching message', () => {
				assert.strictEqual(HttpError.getMessageForStatusCode(456), 'mock 456 message');
			});
		});

		describe('when the status code is an invalid HTTP status code between 400 and 499', () => {
			it('returns the message for a 400 error', () => {
				assert.strictEqual(HttpError.getMessageForStatusCode(468), 'mock 400 message');
			});
		});

		describe('when the status code is an invalid HTTP status code greater than 499', () => {
			it('returns the message for a 500 error', () => {
				assert.strictEqual(HttpError.getMessageForStatusCode(567), 'mock 500 message');
			});
		});

		describe('when the status code is an invalid HTTP status code less than 400', () => {
			it('returns the message for a 500 error', () => {
				assert.strictEqual(HttpError.getMessageForStatusCode(137), 'mock 500 message');
			});
		});
	});

	describe('.default', () => {
		it('aliases the module exports', () => {
			assert.strictEqual(HttpError.default, HttpError);
		});
	});
});
