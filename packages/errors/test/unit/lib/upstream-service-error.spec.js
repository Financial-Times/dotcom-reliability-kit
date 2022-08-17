const HttpError = require('../../../lib/http-error');
const UpstreamServiceError = require('../../../lib/upstream-service-error');

describe('@dotcom-reliability-kit/errors/lib/upstream-service-error', () => {
	afterEach(() => {
		jest.restoreAllMocks();
	});

	it('exports a class', () => {
		expect(UpstreamServiceError).toBeInstanceOf(Function);
		expect(() => {
			UpstreamServiceError();
		}).toThrow(/class constructor/i);
	});

	it('extends the HttpError class', () => {
		expect(UpstreamServiceError.prototype).toBeInstanceOf(HttpError);
	});

	describe('new UpstreamServiceError()', () => {
		let instance;

		beforeEach(() => {
			jest
				.spyOn(HttpError, 'getMessageForStatusCode')
				.mockReturnValue('mock status message');
			instance = new UpstreamServiceError();
		});

		describe('.code', () => {
			it('is set to "HTTP_502"', () => {
				expect(instance.code).toStrictEqual('HTTP_502');
			});
		});

		describe('.data', () => {
			it('is set to an empty object', () => {
				expect(instance.data).toEqual({});
			});
		});

		describe('.message', () => {
			it('is set to the status message for the default 502 code', () => {
				expect(instance.message).toStrictEqual('mock status message');
			});
		});

		describe('.name', () => {
			it('is set to "UpstreamServiceError"', () => {
				expect(instance.name).toStrictEqual('UpstreamServiceError');
			});
		});

		describe('.statusCode', () => {
			it('is set to 502', () => {
				expect(instance.statusCode).toStrictEqual(502);
			});
		});

		describe('.status', () => {
			it('aliases the `statusCode` property', () => {
				instance.statusCode = 'mock status';
				expect(instance.status).toStrictEqual('mock status');
			});
		});

		describe('.statusMessage', () => {
			it('is set to the status message for the default 502 code', () => {
				expect(instance.statusMessage).toStrictEqual('mock status message');
			});
		});
	});

	describe('new UpstreamServiceError(message)', () => {
		let instance;

		beforeEach(() => {
			jest
				.spyOn(HttpError, 'getMessageForStatusCode')
				.mockReturnValue('mock status message');
			instance = new UpstreamServiceError('mock message');
		});

		describe('.code', () => {
			it('is set to "HTTP_502"', () => {
				expect(instance.code).toStrictEqual('HTTP_502');
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
			it('is set to "UpstreamServiceError"', () => {
				expect(instance.name).toStrictEqual('UpstreamServiceError');
			});
		});

		describe('.statusCode', () => {
			it('is set to 502', () => {
				expect(instance.statusCode).toStrictEqual(502);
			});
		});

		describe('.status', () => {
			it('aliases the `statusCode` property', () => {
				instance.statusCode = 'mock status';
				expect(instance.status).toStrictEqual('mock status');
			});
		});

		describe('.statusMessage', () => {
			it('is set to the status message for the default 502 code', () => {
				expect(instance.statusMessage).toStrictEqual('mock status message');
			});
		});
	});

	describe('new UpstreamServiceError(statusCode)', () => {
		let instance;

		beforeEach(() => {
			jest.spyOn(HttpError, 'normalizeErrorStatusCode').mockReturnValue(456);
			jest
				.spyOn(HttpError, 'getMessageForStatusCode')
				.mockReturnValue('mock status message');
			instance = new UpstreamServiceError(456);
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
			it('is set to "UpstreamServiceError"', () => {
				expect(instance.name).toStrictEqual('UpstreamServiceError');
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

	describe('new UpstreamServiceError(data)', () => {
		let instance;

		beforeEach(() => {
			jest.spyOn(HttpError, 'normalizeErrorCode').mockReturnValue('MOCK_CODE');
			jest.spyOn(HttpError, 'normalizeErrorStatusCode').mockReturnValue(456);
			jest
				.spyOn(HttpError, 'getMessageForStatusCode')
				.mockReturnValue('mock status message');
			instance = new UpstreamServiceError({
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
			it('is set to "UpstreamServiceError"', () => {
				expect(instance.name).toStrictEqual('UpstreamServiceError');
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
});
