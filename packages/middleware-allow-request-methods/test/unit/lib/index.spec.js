const { allowRequestMethods } = require('../../../lib/index');
const { UserInputError } = require('@dotcom-reliability-kit/errors');

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
			header: jest.fn()
		};
		mockNext = jest.fn();
	});

	afterEach(() => {
		// Clear all mocks after each test
		jest.clearAllMocks();
	});

	describe('initialisation and validation', () => {
		it('throws TypeError when no allowedMethods are provided', () => {
			expect(() => {
				allowRequestMethods();
			}).toThrow(TypeError);

			expect(() => {
				allowRequestMethods({});
			}).toThrow('The `allowedMethods` option must be an array of strings');
		});

		it('throws TypeError when allowedMethods is an empty array', () => {
			expect(() => {
				allowRequestMethods({ allowedMethods: [] });
			}).toThrow(TypeError);
		});

		it('throws TypeError when allowedMethods contains non-string values', () => {
			expect(() => {
				allowRequestMethods({ allowedMethods: [123, true] });
			}).toThrow(TypeError);
		});

		it('creates middleware function when valid allowedMethods are provided', () => {
			const middleware = allowRequestMethods({
				allowedMethods: ['GET', 'POST']
			});
			expect(typeof middleware).toBe('function');
		});
	});

	describe('middleware behavior', () => {
		it('sets Allow header with normalised methods', () => {
			const middleware = allowRequestMethods({
				allowedMethods: ['get', 'post']
			});

			middleware(mockRequest, mockResponse, mockNext);

			expect(mockResponse.header).toHaveBeenCalledWith('Allow', 'GET, POST');
		});

		it('skips setting header if headers are already sent', () => {
			mockResponse.headersSent = true;
			const middleware = allowRequestMethods({
				allowedMethods: ['GET', 'POST']
			});

			middleware(mockRequest, mockResponse, mockNext);

			expect(mockResponse.header).not.toHaveBeenCalled();
		});

		it('calls next() with 405 error for disallowed method', () => {
			mockRequest.method = 'DELETE';
			const middleware = allowRequestMethods({
				allowedMethods: ['GET', 'POST']
			});

			middleware(mockRequest, mockResponse, mockNext);

			expect(mockNext).toHaveBeenCalledWith(expect.any(UserInputError));
			const error = mockNext.mock.calls[0][0];
			expect(error.statusCode).toBe(405);
		});

		it('calls next() without error for allowed method', () => {
			mockRequest.method = 'GET';
			const middleware = allowRequestMethods({
				allowedMethods: ['GET', 'POST']
			});

			middleware(mockRequest, mockResponse, mockNext);

			expect(mockNext).toHaveBeenCalledWith();
		});

		it('handles case-insensitive method matching', () => {
			mockRequest.method = 'get';
			const middleware = allowRequestMethods({
				allowedMethods: ['GET', 'POST']
			});

			middleware(mockRequest, mockResponse, mockNext);

			expect(mockNext).toHaveBeenCalledWith();
		});
	});

	describe('normaliseAllowedRequestMethods', () => {
		it('normalises methods to uppercase', () => {
			const middleware = allowRequestMethods({
				allowedMethods: ['get', 'Post', 'DELETE']
			});

			middleware(mockRequest, mockResponse, mockNext);

			expect(mockResponse.header).toHaveBeenCalledWith(
				'Allow',
				'GET, POST, DELETE'
			);
		});
	});
});
