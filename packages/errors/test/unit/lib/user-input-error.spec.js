const { UpstreamServiceError } = require('../../../lib');
const HttpError = require('../../../lib/http-error');
const UserInputError = require('../../../lib/user-input-error');

jest.mock('http', () => ({
	STATUS_CODES: {
		400: 'mock 400 message',
		456: 'mock 456 message',
		500: 'mock 500 message'
	}
}));

describe('@dotcom-reliability-kit/errors/lib/user-input-error', () => {
	afterEach(() => {
		jest.restoreAllMocks();
	});

	it('exports a class', () => {
		expect(UserInputError).toBeInstanceOf(Function);
		expect(() => {
			UserInputError();
		}).toThrow(/class constructor/i);
	});

	it('extends the HttpError class', () => {
		expect(UserInputError.prototype).toBeInstanceOf(HttpError);
	});

	describe('new UserInputError()', () => {
		let instance;

		beforeEach(() => {
			jest
				.spyOn(HttpError, 'getMessageForStatusCode')
				.mockReturnValue('mock status message');
			instance = new UserInputError();
		});

		describe('.code', () => {
			it('is set to "HTTP_400"', () => {
				expect(instance.code).toStrictEqual('HTTP_400');
			});
		});

		describe('.data', () => {
			it('is set to an empty object', () => {
				expect(instance.data).toEqual({});
			});
		});

		describe('.message', () => {
			it('is set to the status message for the default 400 code', () => {
				expect(instance.message).toStrictEqual('mock status message');
			});
		});

		describe('.name', () => {
			it('is set to "UserInputError"', () => {
				expect(instance.name).toStrictEqual('UserInputError');
			});
		});

		describe('.statusCode', () => {
			it('is set to 400', () => {
				expect(instance.statusCode).toStrictEqual(400);
			});
		});

		describe('.status', () => {
			it('aliases the `statusCode` property', () => {
				instance.statusCode = 'mock status';
				expect(instance.status).toStrictEqual('mock status');
			});
		});

		describe('.statusMessage', () => {
			it('is set to the status message for the default 400 code', () => {
				expect(instance.statusMessage).toStrictEqual('mock status message');
			});
		});
	});

	describe('new UserInputError(message)', () => {
		let instance;

		beforeEach(() => {
			jest
				.spyOn(HttpError, 'getMessageForStatusCode')
				.mockReturnValue('mock status message');
			instance = new UserInputError('mock message');
		});

		describe('.code', () => {
			it('is set to "HTTP_400"', () => {
				expect(instance.code).toStrictEqual('HTTP_400');
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
			it('is set to "UserInputError"', () => {
				expect(instance.name).toStrictEqual('UserInputError');
			});
		});

		describe('.statusCode', () => {
			it('is set to 400', () => {
				expect(instance.statusCode).toStrictEqual(400);
			});
		});

		describe('.status', () => {
			it('aliases the `statusCode` property', () => {
				instance.statusCode = 'mock status';
				expect(instance.status).toStrictEqual('mock status');
			});
		});

		describe('.statusMessage', () => {
			it('is set to the status message for the default 400 code', () => {
				expect(instance.statusMessage).toStrictEqual('mock status message');
			});
		});
	});

	describe('new UserInputError(data)', () => {
		let instance;

		beforeEach(() => {
			jest.spyOn(HttpError, 'normalizeErrorCode').mockReturnValue('MOCK_CODE');
			jest.spyOn(HttpError, 'normalizeErrorStatusCode').mockReturnValue(456);
			jest
				.spyOn(HttpError, 'getMessageForStatusCode')
				.mockReturnValue('mock status message');
			instance = new UserInputError({
				message: 'mock message',
				code: 'mock_code',
				statusCode: 567,
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
			it('is set to "UserInputError"', () => {
				expect(instance.name).toStrictEqual('UserInputError');
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

	describe('.default', () => {
		it('aliases the module exports', () => {
			expect(UpstreamServiceError.default).toStrictEqual(UpstreamServiceError);
		});
	});
});
