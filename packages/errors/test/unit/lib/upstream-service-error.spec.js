const { afterEach, beforeEach, describe, it, mock } = require('node:test');
const assert = require('node:assert/strict');

const HttpError = require('../../../lib/http-error');
const UpstreamServiceError = require('../../../lib/upstream-service-error');

describe('@dotcom-reliability-kit/errors/lib/upstream-service-error', () => {
	afterEach(() => {
		mock.restoreAll();
	});

	it('exports a class', () => {
		assert.ok(UpstreamServiceError instanceof Function);
		assert.throws(() => UpstreamServiceError(), /class constructor/i);
	});

	it('extends the HttpError class', () => {
		assert.ok(UpstreamServiceError.prototype instanceof HttpError);
	});

	describe('new UpstreamServiceError()', () => {
		let instance;

		beforeEach(() => {
			mock.method(HttpError, 'getMessageForStatusCode', () => 'mock status message');
			instance = new UpstreamServiceError();
		});

		describe('.code', () => {
			it('is set to "HTTP_502"', () => {
				assert.strictEqual(instance.code, 'HTTP_502');
			});
		});

		describe('.data', () => {
			it('is set to an empty object', () => {
				assert.deepStrictEqual(instance.data, {});
			});
		});

		describe('.message', () => {
			it('is set to the status message for the default 502 code', () => {
				assert.strictEqual(instance.message, 'mock status message');
			});
		});

		describe('.name', () => {
			it('is set to "UpstreamServiceError"', () => {
				assert.strictEqual(instance.name, 'UpstreamServiceError');
			});
		});

		describe('.statusCode', () => {
			it('is set to 502', () => {
				assert.strictEqual(instance.statusCode, 502);
			});
		});

		describe('.status', () => {
			it('aliases the `statusCode` property', () => {
				instance.statusCode = 'mock status';
				assert.strictEqual(instance.status, 'mock status');
			});
		});

		describe('.statusMessage', () => {
			it('is set to the status message for the default 502 code', () => {
				assert.strictEqual(instance.statusMessage, 'mock status message');
			});
		});
	});

	describe('new UpstreamServiceError(message)', () => {
		let instance;

		beforeEach(() => {
			mock.method(HttpError, 'getMessageForStatusCode', () => 'mock status message');
			instance = new UpstreamServiceError('mock message');
		});

		describe('.code', () => {
			it('is set to "HTTP_502"', () => {
				assert.strictEqual(instance.code, 'HTTP_502');
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
			it('is set to "UpstreamServiceError"', () => {
				assert.strictEqual(instance.name, 'UpstreamServiceError');
			});
		});

		describe('.statusCode', () => {
			it('is set to 502', () => {
				assert.strictEqual(instance.statusCode, 502);
			});
		});

		describe('.status', () => {
			it('aliases the `statusCode` property', () => {
				instance.statusCode = 'mock status';
				assert.strictEqual(instance.status, 'mock status');
			});
		});

		describe('.statusMessage', () => {
			it('is set to the status message for the default 502 code', () => {
				assert.strictEqual(instance.statusMessage, 'mock status message');
			});
		});
	});

	describe('new UpstreamServiceError(statusCode)', () => {
		let instance;

		beforeEach(() => {
			mock.method(HttpError, 'normalizeErrorStatusCode', () => 456);
			mock.method(HttpError, 'getMessageForStatusCode', () => 'mock status message');
			instance = new UpstreamServiceError(456);
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
			it('is set to "UpstreamServiceError"', () => {
				assert.strictEqual(instance.name, 'UpstreamServiceError');
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

	describe('new UpstreamServiceError(data)', () => {
		let instance;

		beforeEach(() => {
			mock.method(HttpError, 'normalizeErrorCode', () => 'MOCK_CODE');
			mock.method(HttpError, 'normalizeErrorStatusCode', () => 456);
			mock.method(HttpError, 'getMessageForStatusCode', () => 'mock status message');
			instance = new UpstreamServiceError({
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
			it('is set to "UpstreamServiceError"', () => {
				assert.strictEqual(instance.name, 'UpstreamServiceError');
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

	describe('new UpstreamServiceError(message, data)', () => {
		let instance;

		beforeEach(() => {
			mock.method(HttpError, 'normalizeErrorCode', () => 'MOCK_CODE');
			mock.method(HttpError, 'normalizeErrorStatusCode', () => 456);
			instance = new UpstreamServiceError('mock message', {
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

	describe('new UpstreamServiceError(message, data)', () => {
		let instance;

		beforeEach(() => {
			mock.method(HttpError, 'normalizeErrorCode', () => 'MOCK_CODE');
			mock.method(HttpError, 'normalizeErrorStatusCode', () => 456);
			instance = new UpstreamServiceError(567, {
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

	describe('.default', () => {
		it('aliases the module exports', () => {
			assert.strictEqual(UpstreamServiceError.default, UpstreamServiceError);
		});
	});
});
