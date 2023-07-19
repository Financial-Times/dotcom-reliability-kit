const BaseError = require('../../../lib/base-error');
const HttpError = require('../../../lib/http-error');
const OperationalError = require('../../../lib/operational-error');

jest.mock('http', () => ({
	STATUS_CODES: {
		400: 'mock 400 message',
		456: 'mock 456 message',
		500: 'mock 500 message'
	}
}));

describe('@dotcom-reliability-kit/errors/lib/http-error', () => {
	afterEach(() => {
		jest.restoreAllMocks();
	});

	it('exports a class', () => {
		expect(HttpError).toBeInstanceOf(Function);
		expect(() => {
			HttpError();
		}).toThrow(/class constructor/i);
	});

	it('extends the OperationalError class', () => {
		expect(HttpError.prototype).toBeInstanceOf(OperationalError);
	});

	describe('new HttpError()', () => {
		let instance;

		beforeEach(() => {
			jest
				.spyOn(HttpError, 'getMessageForStatusCode')
				.mockReturnValue('mock status message');
			instance = new HttpError();
		});

		it('gets the status message for the 500 code', () => {
			expect(HttpError.getMessageForStatusCode).toBeCalledWith(500);
		});

		describe('.code', () => {
			it('is set to "HTTP_500"', () => {
				expect(instance.code).toStrictEqual('HTTP_500');
			});
		});

		describe('.data', () => {
			it('is set to an empty object', () => {
				expect(instance.data).toEqual({});
			});
		});

		describe('.message', () => {
			it('is set to the status message for the default 500 code', () => {
				expect(instance.message).toStrictEqual('mock status message');
			});
		});

		describe('.name', () => {
			it('is set to "HttpError"', () => {
				expect(instance.name).toStrictEqual('HttpError');
			});
		});

		describe('.statusCode', () => {
			it('is set to 500', () => {
				expect(instance.statusCode).toStrictEqual(500);
			});
		});

		describe('.status', () => {
			it('aliases the `statusCode` property', () => {
				instance.statusCode = 'mock status';
				expect(instance.status).toStrictEqual('mock status');
			});
		});

		describe('.statusMessage', () => {
			it('is set to the status message for the default 500 code', () => {
				expect(instance.statusMessage).toStrictEqual('mock status message');
			});
		});
	});

	describe('new HttpError(message)', () => {
		let instance;

		beforeEach(() => {
			jest
				.spyOn(HttpError, 'getMessageForStatusCode')
				.mockReturnValue('mock status message');
			instance = new HttpError('mock message');
		});

		it('gets the status message for the 500 code', () => {
			expect(HttpError.getMessageForStatusCode).toBeCalledWith(500);
		});

		describe('.code', () => {
			it('is set to "HTTP_500"', () => {
				expect(instance.code).toStrictEqual('HTTP_500');
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
			it('is set to "HttpError"', () => {
				expect(instance.name).toStrictEqual('HttpError');
			});
		});

		describe('.statusCode', () => {
			it('is set to 500', () => {
				expect(instance.statusCode).toStrictEqual(500);
			});
		});

		describe('.status', () => {
			it('aliases the `statusCode` property', () => {
				instance.statusCode = 'mock status';
				expect(instance.status).toStrictEqual('mock status');
			});
		});

		describe('.statusMessage', () => {
			it('is set to the status message for the default 500 code', () => {
				expect(instance.statusMessage).toStrictEqual('mock status message');
			});
		});
	});

	describe('new HttpError(statusCode)', () => {
		let instance;

		beforeEach(() => {
			jest.spyOn(HttpError, 'normalizeErrorStatusCode').mockReturnValue(456);
			jest
				.spyOn(HttpError, 'getMessageForStatusCode')
				.mockReturnValue('mock status message');
			instance = new HttpError(567);
		});

		it('normalizes the passed in status code', () => {
			expect(HttpError.normalizeErrorStatusCode).toBeCalledWith(567);
		});

		it('gets the status message for the normalized code', () => {
			expect(HttpError.getMessageForStatusCode).toBeCalledWith(456);
		});

		describe('.code', () => {
			it('is set to a code representing the normalized status code', () => {
				expect(instance.code).toStrictEqual('HTTP_456');
			});
		});

		describe('.data', () => {
			it('is set to an empty object', () => {
				expect(instance.data).toEqual({});
			});
		});

		describe('.message', () => {
			it('is set to the status message for the normalized status code', () => {
				expect(instance.message).toStrictEqual('mock status message');
			});
		});

		describe('.name', () => {
			it('is set to "HttpError"', () => {
				expect(instance.name).toStrictEqual('HttpError');
			});
		});

		describe('.statusCode', () => {
			it('is set to the normalized status code', () => {
				expect(instance.statusCode).toStrictEqual(456);
			});
		});

		describe('.status', () => {
			it('aliases the `statusCode` property', () => {
				instance.statusCode = 'mock status';
				expect(instance.status).toStrictEqual('mock status');
			});
		});

		describe('.statusMessage', () => {
			it('is set to the status message for the normalized status code', () => {
				expect(instance.statusMessage).toStrictEqual('mock status message');
			});
		});
	});

	describe('new HttpError(data)', () => {
		let instance;

		beforeEach(() => {
			jest.spyOn(BaseError, 'normalizeErrorCode').mockReturnValue('MOCK_CODE');
			jest.spyOn(HttpError, 'normalizeErrorStatusCode').mockReturnValue(456);
			jest
				.spyOn(HttpError, 'getMessageForStatusCode')
				.mockReturnValue('mock status message');
			instance = new HttpError({
				message: 'mock message',
				code: 'mock_code',
				statusCode: 567,
				extra: 'mock extra data'
			});
		});

		it('normalizes the passed in error code', () => {
			expect(HttpError.normalizeErrorCode).toBeCalledWith('mock_code');
		});

		it('normalizes the passed in status code', () => {
			expect(HttpError.normalizeErrorStatusCode).toBeCalledWith(567);
		});

		it('gets the status message for the normalized code', () => {
			expect(HttpError.getMessageForStatusCode).toBeCalledWith(456);
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
			it('is set to "HttpError"', () => {
				expect(instance.name).toStrictEqual('HttpError');
			});
		});

		describe('.statusCode', () => {
			it('is set to the normalized status code', () => {
				expect(instance.statusCode).toStrictEqual(456);
			});
		});

		describe('.status', () => {
			it('aliases the `statusCode` property', () => {
				instance.statusCode = 'mock status';
				expect(instance.status).toStrictEqual('mock status');
			});
		});

		describe('.statusMessage', () => {
			it('is set to the status message for the passed in status code', () => {
				expect(instance.statusMessage).toStrictEqual('mock status message');
			});
		});
	});

	describe('new HttpError(message, data)', () => {
		let instance;

		beforeEach(() => {
			jest.spyOn(BaseError, 'normalizeErrorCode').mockReturnValue('MOCK_CODE');
			jest.spyOn(HttpError, 'normalizeErrorStatusCode').mockReturnValue(456);
			instance = new HttpError('mock message', {
				code: 'mock_code',
				statusCode: 567
			});
		});

		it('normalizes the passed in error code', () => {
			expect(HttpError.normalizeErrorCode).toBeCalledWith('mock_code');
		});

		it('normalizes the passed in status code', () => {
			expect(HttpError.normalizeErrorStatusCode).toBeCalledWith(567);
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

		describe('.statusCode', () => {
			it('is set to the normalized status code', () => {
				expect(instance.statusCode).toStrictEqual(456);
			});
		});
	});

	describe('new HttpError(statusCode, data)', () => {
		let instance;

		beforeEach(() => {
			jest.spyOn(BaseError, 'normalizeErrorCode').mockReturnValue('MOCK_CODE');
			jest.spyOn(HttpError, 'normalizeErrorStatusCode').mockReturnValue(456);
			instance = new HttpError(567, {
				message: 'mock message',
				code: 'mock_code'
			});
		});

		it('normalizes the passed in error code', () => {
			expect(HttpError.normalizeErrorCode).toBeCalledWith('mock_code');
		});

		it('normalizes the passed in status code', () => {
			expect(HttpError.normalizeErrorStatusCode).toBeCalledWith(567);
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

		describe('.statusCode', () => {
			it('is set to the normalized status code', () => {
				expect(instance.statusCode).toStrictEqual(456);
			});
		});
	});

	describe('.normalizeErrorStatusCode(statusCode)', () => {
		describe('when the status code is a valid error code', () => {
			it('returns the passed in status code', () => {
				expect(HttpError.normalizeErrorStatusCode(456)).toStrictEqual(456);
			});
		});

		describe('when the status code is less than 400', () => {
			it('returns 500', () => {
				expect(HttpError.normalizeErrorStatusCode(345)).toStrictEqual(500);
			});
		});

		describe('when the status code is greater than 500', () => {
			it('returns 500', () => {
				expect(HttpError.normalizeErrorStatusCode(678)).toStrictEqual(500);
			});
		});

		describe('when the status code is a floating point number', () => {
			it('returns the floored number', () => {
				expect(HttpError.normalizeErrorStatusCode(456.8)).toStrictEqual(456);
			});
		});
	});

	describe('.getMessageForStatusCode(statusCode)', () => {
		describe('when the status code is a valid HTTP status code', () => {
			it('returns the matching message', () => {
				expect(HttpError.getMessageForStatusCode(456)).toStrictEqual(
					'mock 456 message'
				);
			});
		});

		describe('when the status code is an invalid HTTP status code between 400 and 499', () => {
			it('returns the message for a 400 error', () => {
				expect(HttpError.getMessageForStatusCode(468)).toStrictEqual(
					'mock 400 message'
				);
			});
		});

		describe('when the status code is an invalid HTTP status code greater than 499', () => {
			it('returns the message for a 500 error', () => {
				expect(HttpError.getMessageForStatusCode(567)).toStrictEqual(
					'mock 500 message'
				);
			});
		});

		describe('when the status code is an invalid HTTP status code less than 400', () => {
			it('returns the message for a 500 error', () => {
				expect(HttpError.getMessageForStatusCode(137)).toStrictEqual(
					'mock 500 message'
				);
			});
		});
	});

	describe('.default', () => {
		it('aliases the module exports', () => {
			expect(HttpError.default).toStrictEqual(HttpError);
		});
	});
});
