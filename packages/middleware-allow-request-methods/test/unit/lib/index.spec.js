const { afterEach, beforeEach, describe, it, mock } = require('node:test');
const assert = require('node:assert/strict');

const UserInputError = mock.fn(class UserInputError {});
mock.module('@dotcom-reliability-kit/errors', { namedExports: { UserInputError } });

const { allowRequestMethods } = require('@dotcom-reliability-kit/middleware-allow-request-methods');

// Mock Express request and response objects
let mockRequest;
let mockResponse;
let mockNext;

describe('allowRequestMethods', () => {
	beforeEach(() => {
		// Reset all mocks before each test
		mockRequest = {
			method: 'GET'
		};
		mockResponse = {
			headersSent: false,
			header: mock.fn()
		};
		mockNext = mock.fn();
	});

	afterEach(() => {
		// Clear all mocks after each test
		mock.restoreAll();
	});

	describe('initialisation and validation', () => {
		it('throws TypeError when no allowedMethods are provided', () => {
			assert.throws(() => {
				allowRequestMethods();
			}, new TypeError('The `allowedMethods` option must be an array of strings'));
		});

		it('throws TypeError when allowedMethods is an empty array', () => {
			assert.throws(() => {
				allowRequestMethods({ allowedMethods: [] });
			}, TypeError);
		});

		it('throws TypeError when allowedMethods contains non-string values', () => {
			assert.throws(() => {
				allowRequestMethods({ allowedMethods: [123, true] });
			}, TypeError);
		});

		it('creates middleware function when valid allowedMethods are provided', () => {
			const middleware = allowRequestMethods({
				allowedMethods: ['GET', 'POST']
			});
			assert.strictEqual(typeof middleware, 'function');
		});
	});

	describe('middleware behavior', () => {
		it('sets Allow header with normalised methods', () => {
			const middleware = allowRequestMethods({
				allowedMethods: ['get', 'post']
			});

			middleware(mockRequest, mockResponse, mockNext);

			assert.strictEqual(mockResponse.header.mock.callCount(), 1);
			assert.deepStrictEqual(mockResponse.header.mock.calls[0].arguments, [
				'Allow',
				'GET, POST'
			]);
		});

		it('skips setting header if headers are already sent', () => {
			mockResponse.headersSent = true;
			const middleware = allowRequestMethods({
				allowedMethods: ['GET', 'POST']
			});

			middleware(mockRequest, mockResponse, mockNext);

			assert.strictEqual(mockResponse.header.mock.callCount(), 0);
		});

		it('calls next() with 405 error for disallowed method', () => {
			mockRequest.method = 'DELETE';
			const middleware = allowRequestMethods({
				allowedMethods: ['GET', 'POST']
			});

			middleware(mockRequest, mockResponse, mockNext);

			assert.strictEqual(mockNext.mock.callCount(), 1);
			const error = mockNext.mock.calls[0].arguments[0];
			assert.ok(error instanceof UserInputError);
			assert.strictEqual(UserInputError.mock.callCount(), 1);
			assert.deepStrictEqual(UserInputError.mock.calls[0].arguments[0], { statusCode: 405 });
		});

		it('calls next() without error for allowed method', () => {
			mockRequest.method = 'GET';
			const middleware = allowRequestMethods({
				allowedMethods: ['GET', 'POST']
			});

			middleware(mockRequest, mockResponse, mockNext);

			assert.strictEqual(mockNext.mock.callCount(), 1);
			assert.deepStrictEqual(mockNext.mock.calls[0].arguments, []);
		});
	});

	describe('normaliseAllowedRequestMethods', () => {
		it('normalises methods to uppercase', () => {
			const middleware = allowRequestMethods({
				allowedMethods: ['get', 'Post', 'DELETE']
			});

			middleware(mockRequest, mockResponse, mockNext);

			assert.strictEqual(mockResponse.header.mock.callCount(), 1);
			assert.deepStrictEqual(mockResponse.header.mock.calls[0].arguments, [
				'Allow',
				'GET, POST, DELETE'
			]);
		});
	});
});
