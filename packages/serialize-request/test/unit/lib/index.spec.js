const serializeRequest = require('../../../lib/index');

describe('@dotcom-reliability-kit/serialize-request', () => {
	describe('.default', () => {
		it('aliases the module exports', () => {
			expect(serializeRequest.default).toStrictEqual(serializeRequest);
		});
	});

	describe('.DEFAULT_INCLUDED_HEADERS', () => {
		it('is an array of included headers', () => {
			expect(serializeRequest.DEFAULT_INCLUDED_HEADERS).toEqual([
				'accept',
				'accept-encoding',
				'accept-language',
				'content-type',
				'referer',
				'user-agent'
			]);
		});

		it('is readonly', () => {
			expect(() => {
				serializeRequest.DEFAULT_INCLUDED_HEADERS.push('nope');
			}).toThrowError(TypeError);

			serializeRequest.DEFAULT_INCLUDED_HEADERS[0] = 'nope';
			expect(serializeRequest.DEFAULT_INCLUDED_HEADERS[0]).not.toEqual('nope');
		});
	});

	describe('when called with an `http.IncomingMessage` object', () => {
		let request;

		beforeEach(() => {
			request = {
				method: 'get',
				url: '/mock-url',
				headers: {
					accept: '*/*',
					'accept-encoding': 'gzip',
					'accept-language': 'en-US',
					'content-type': 'application/json',
					'mock-header': 'mock-param-value',
					referer: 'https://foo.com',
					'user-agent': 'Mozilla/5.0',
					'x-request-id': 'mock-id'
				}
			};
		});

		it('returns the expected serialized request properties', () => {
			expect(serializeRequest(request)).toEqual({
				id: 'mock-id',
				method: 'GET',
				url: '/mock-url',
				headers: {
					accept: '*/*',
					'accept-encoding': 'gzip',
					'accept-language': 'en-US',
					'content-type': 'application/json',
					referer: 'https://foo.com',
					'user-agent': 'Mozilla/5.0'
				}
			});
		});
	});

	describe('when called with an `express.Request` object', () => {
		let request;

		beforeEach(() => {
			request = {
				method: 'get',
				url: '/mock-url',
				headers: {
					accept: '*/*',
					'accept-encoding': 'gzip',
					'accept-language': 'en-US',
					'content-type': 'application/json',
					referer: 'https://foo.com',
					'user-agent': 'Mozilla/5.0',
					'mock-header': 'mock-param-value',
					'x-request-id': 'mock-id'
				},
				route: {
					path: '/mock-route-path'
				},
				params: {
					'mock-param': 'mock-param-value'
				}
			};
		});

		it('returns the expected serialized request properties', () => {
			expect(serializeRequest(request)).toEqual({
				id: 'mock-id',
				method: 'GET',
				url: '/mock-url',
				headers: {
					accept: '*/*',
					'accept-encoding': 'gzip',
					'accept-language': 'en-US',
					'content-type': 'application/json',
					referer: 'https://foo.com',
					'user-agent': 'Mozilla/5.0'
				},
				route: {
					path: '/mock-route-path',
					params: {
						'mock-param': 'mock-param-value'
					}
				}
			});
		});
	});

	describe('when called with an request-like object', () => {
		let request;

		beforeEach(() => {
			request = {
				method: 'get',
				url: '/mock-url',
				headers: {
					accept: '*/*',
					'content-type': 'application/json',
					'mock-header': 'mock-param-value',
					'x-request-id': 'mock-id'
				},
				route: {
					path: '/mock-route-path'
				},
				params: {
					'mock-param': 'mock-param-value'
				}
			};
		});

		describe('when `request.headers.x-request-id` is undefined', () => {
			beforeEach(() => {
				delete request.headers['x-request-id'];
			});

			it('defaults the serialized ID to `null`', () => {
				expect(serializeRequest(request)).toMatchObject({
					id: null
				});
			});
		});

		describe('when `request.method` is undefined', () => {
			beforeEach(() => {
				delete request.method;
			});

			it('defaults the serialized method to "-"', () => {
				expect(serializeRequest(request)).toMatchObject({
					method: '-'
				});
			});
		});

		describe('when `request.method` is not a string', () => {
			beforeEach(() => {
				request.method = 123;
			});

			it('casts the method to a string', () => {
				expect(serializeRequest(request)).toMatchObject({
					method: '123'
				});
			});
		});

		describe('when `request.url` is undefined', () => {
			beforeEach(() => {
				delete request.url;
			});

			it('defaults the serialized url to "/"', () => {
				expect(serializeRequest(request)).toMatchObject({
					url: '/'
				});
			});
		});

		describe('when `request.url` is not a string', () => {
			beforeEach(() => {
				request.url = 123;
			});

			it('casts the url to a string', () => {
				expect(serializeRequest(request)).toMatchObject({
					url: '123'
				});
			});
		});

		describe('when `request.headers` is undefined', () => {
			beforeEach(() => {
				delete request.headers;
			});

			it('defaults the serialized headers to an empty object', () => {
				expect(serializeRequest(request)).toMatchObject({
					headers: {}
				});
			});
		});

		describe('when `request.headers` is not an object', () => {
			beforeEach(() => {
				request.headers = ['a', 'b', 'c'];
			});

			it('defaults the serialized headers to an empty object', () => {
				expect(serializeRequest(request)).toMatchObject({
					headers: {}
				});
			});
		});
		describe('when `request.headers` is iterable', () => {
			beforeEach(() => {
				request.headers = new Map([
					['Content-Type', 'application/json'],
					['Authorization', 'Bearer token']
				]);
			});
			it('should handle headers as an iterable', () => {
				expect(serializeRequest(request)).toMatchObject({
					headers: { 'content-type': 'application/json' }
				});
			});
		});

		describe('when `request.headers` is iterable but has non-string values', () => {
			beforeEach(() => {
				request.headers = new Map([
					['Content-Type', 123],
					['accept', {}]
				]);
			});
			it('should ignore the headers with non-string values', () => {
				expect(serializeRequest(request)).toMatchObject({
					headers: {}
				});
			});
		});

		describe('when `request.route.path` is not a string', () => {
			beforeEach(() => {
				request.route.path = 123;
			});

			it('does not include a `route` property in the output', () => {
				expect(serializeRequest(request).route).toBeUndefined();
			});
		});

		describe('when `request.params` is not defined', () => {
			beforeEach(() => {
				delete request.params;
			});

			it('defaults the serialized route params to an empty object', () => {
				expect(serializeRequest(request).route).toMatchObject({
					params: {}
				});
			});
		});
	});

	describe('when called with a string', () => {
		it('returns the expected serialized request properties', () => {
			const request = 'mock message';
			expect(serializeRequest(request)).toEqual({
				id: null,
				method: '-',
				url: 'mock message',
				headers: {}
			});
		});
	});

	describe('when the `includeHeaders` option is set', () => {
		let request;

		beforeEach(() => {
			request = {
				method: 'get',
				url: '/mock-url',
				headers: {
					accept: '*/*',
					'content-type': 'application/json',
					'mock-header': 'mock-param-value',
					'x-request-id': 'mock-id'
				}
			};
		});

		it('only includes the specified headers in the serialized request object', () => {
			expect(
				serializeRequest(request, {
					includeHeaders: ['mock-header', 'content-type', 'mock-second-header']
				})
			).toMatchObject({
				headers: {
					'content-type': 'application/json',
					'mock-header': 'mock-param-value'
				}
			});
		});
	});

	describe('when the `includeHeaders` option is set incorrectly', () => {
		it('throws an error', () => {
			const expectedError = new TypeError(
				'The `includeHeaders` option must be an array of strings'
			);
			expect(() => {
				serializeRequest(
					{},
					{
						includeHeaders: {}
					}
				);
			}).toThrowError(expectedError);
			expect(() => {
				serializeRequest(
					{},
					{
						includeHeaders: ['string', 123, 'another string']
					}
				);
			}).toThrowError(expectedError);
		});
	});
});
