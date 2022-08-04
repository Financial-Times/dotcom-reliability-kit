const serializeError = require('../../lib/index');

describe('@dotcom-reliability-kit/serialize-error', () => {
	describe('when called with an error object', () => {
		let error;

		beforeEach(() => {
			error = new Error('mock message');
		});

		it('returns the expected serialized error properties', () => {
			expect(serializeError(error)).toMatchObject({
				name: 'Error',
				code: 'UNKNOWN',
				message: 'mock message',
				isOperational: false,
				relatesToSystems: [],
				cause: null,
				stack: error.stack,
				statusCode: null,
				data: {}
			});
		});

		describe('when the error is an instance of something other than `Error`', () => {
			it('returns the class name in the serialized error properties', () => {
				error = new TypeError('mock type error');
				expect(serializeError(error)).toMatchObject({
					name: 'TypeError'
				});
			});
		});

		describe('when the error has a `code` property', () => {
			it('returns the code in the serialized error properties', () => {
				error.code = 'MOCK_CODE';
				expect(serializeError(error)).toMatchObject({
					code: 'MOCK_CODE'
				});
			});

			describe('when the `code` property is not a string', () => {
				it('casts the given value to a string', () => {
					error.code = 123;
					expect(serializeError(error)).toMatchObject({
						code: '123'
					});
				});
			});
		});

		describe('when the error has an `isOperational` property', () => {
			it('returns whether the error is operational in the serialized error properties', () => {
				error.isOperational = true;
				expect(serializeError(error)).toMatchObject({
					isOperational: true
				});
			});

			describe('when the `isOperational` property is not a boolean', () => {
				it('casts the given value to a boolean', () => {
					error.isOperational = 1;
					expect(serializeError(error)).toMatchObject({
						isOperational: true
					});
				});
			});
		});

		describe('when the error has a `relatesToSystems` property', () => {
			it('includes the related systems in the error', () => {
				error.relatesToSystems = ['system-one'];
				expect(serializeError(error)).toMatchObject({
					relatesToSystems: ['system-one']
				});
			});

			describe('when the `relatesToSystems` property is not an array', () => {
				it('is set to the default empty array', () => {
					error.relatesToSystems = 'system-one';
					expect(serializeError(error)).toMatchObject({
						relatesToSystems: []
					});
				});
			});
		});

		describe('when the error has a `cause` property', () => {
			it('includes the root cause error instance in serialized form in the serialized error properties', () => {
				const rootCauseErrorInstance = new Error(
					'mock root cause error message'
				);
				error.cause = rootCauseErrorInstance;
				expect(serializeError(error)).toMatchObject({
					cause: serializeError(rootCauseErrorInstance)
				});
				expect(serializeError(error).cause).toMatchObject({
					message: 'mock root cause error message'
				});
			});

			describe('when the `cause` property is not an Error instance', () => {
				it('leaves the property value unassigned', () => {
					error.cause = 'foo';
					expect(serializeError(error)).toMatchObject({
						cause: null
					});
				});
			});
		});

		describe('when the error has a `statusCode` property', () => {
			it('returns the status code in the serialized error properties', () => {
				error.statusCode = 456;
				expect(serializeError(error)).toMatchObject({
					statusCode: 456
				});
			});

			describe('when the `statusCode` property is not a number', () => {
				it('casts the given value to a number', () => {
					error.statusCode = '123';
					expect(serializeError(error)).toMatchObject({
						statusCode: 123
					});
				});
			});
		});

		describe('when the error has a `status` property', () => {
			it('returns the status code in the serialized error properties', () => {
				error.status = 456;
				expect(serializeError(error)).toMatchObject({
					statusCode: 456
				});
			});

			describe('when the `status` property is not a number', () => {
				it('casts the given value to a number', () => {
					error.status = '123';
					expect(serializeError(error)).toMatchObject({
						statusCode: 123
					});
				});
			});
		});

		describe('when the error has additional data', () => {
			it('returns the data in the serialized error properties', () => {
				error.data = {
					isMockData: true
				};
				expect(serializeError(error)).toMatchObject({
					data: {
						isMockData: true
					}
				});
			});

			describe('when the `data` property is not an object', () => {
				it('defaults the data to an empty object', () => {
					error.data = null;
					expect(serializeError(error)).toMatchObject({
						data: {}
					});
				});
			});
		});
	});

	describe('when called with an error-like object', () => {
		let error;

		beforeEach(() => {
			error = {};
		});

		it('returns the expected serialized error properties', () => {
			expect(serializeError(error)).toMatchObject({
				name: 'Error',
				code: 'UNKNOWN',
				message: 'An error occurred',
				isOperational: false,
				relatesToSystems: [],
				cause: null,
				stack: null,
				statusCode: null,
				data: {}
			});
		});

		describe('when the object has a `name` property', () => {
			it('returns the name in the serialized error properties', () => {
				error.name = 'MockError';
				expect(serializeError(error)).toMatchObject({
					name: 'MockError'
				});
			});
		});

		describe('when the object has a `code` property', () => {
			it('returns the code in the serialized error properties', () => {
				error.code = 'MOCK_CODE';
				expect(serializeError(error)).toMatchObject({
					code: 'MOCK_CODE'
				});
			});
		});

		describe('when the object has a `message` property', () => {
			it('returns the message in the serialized error properties', () => {
				error.message = 'mock message';
				expect(serializeError(error)).toMatchObject({
					message: 'mock message'
				});
			});
		});

		describe('when the object has an `isOperational` property', () => {
			it('returns whether the error is operational in the serialized error properties', () => {
				error.isOperational = true;
				expect(serializeError(error)).toMatchObject({
					isOperational: true
				});
			});
		});

		describe('when the error has a `relatesToSystems` property', () => {
			it('includes the related systems in the error', () => {
				error.relatesToSystems = ['system-one'];
				expect(serializeError(error)).toMatchObject({
					relatesToSystems: ['system-one']
				});
			});

			describe('when the `relatesToSystems` property is not an array', () => {
				it('is set to the default empty array', () => {
					error.relatesToSystems = 'system-one';
					expect(serializeError(error)).toMatchObject({
						relatesToSystems: []
					});
				});
			});
		});

		describe('when the object has a `cause` property', () => {
			it('includes the root cause error instance in serialized form in the serialized error properties', () => {
				const rootCauseErrorInstance = new Error(
					'mock root cause error message'
				);
				error.cause = rootCauseErrorInstance;
				expect(serializeError(error)).toMatchObject({
					cause: serializeError(rootCauseErrorInstance)
				});
				expect(serializeError(error).cause).toMatchObject({
					message: 'mock root cause error message'
				});
			});
		});

		describe('when the object has a `statusCode` property', () => {
			it('returns the status code in the serialized error properties', () => {
				error.statusCode = 456;
				expect(serializeError(error)).toMatchObject({
					statusCode: 456
				});
			});
		});

		describe('when the object has a `status` property', () => {
			it('returns the status code in the serialized error properties', () => {
				error.status = 456;
				expect(serializeError(error)).toMatchObject({
					statusCode: 456
				});
			});
		});

		describe('when the object has additional data', () => {
			it('returns the data in the serialized error properties', () => {
				error.data = {
					isMockData: true
				};
				expect(serializeError(error)).toMatchObject({
					data: {
						isMockData: true
					}
				});
			});
		});
	});

	describe('when called with a string', () => {
		it('returns the expected serialized error properties', () => {
			const error = 'mock message';
			expect(serializeError(error)).toMatchObject({
				name: 'Error',
				code: 'UNKNOWN',
				message: 'mock message',
				isOperational: false,
				relatesToSystems: [],
				cause: null,
				stack: null,
				statusCode: null,
				data: {}
			});
		});
	});

	describe('when called with a number', () => {
		it('returns the expected serialized error properties', () => {
			const error = 123;
			expect(serializeError(error)).toMatchObject({
				name: 'Error',
				code: 'UNKNOWN',
				message: '123',
				isOperational: false,
				relatesToSystems: [],
				cause: null,
				stack: null,
				statusCode: null,
				data: {}
			});
		});
	});

	describe('when called with an array', () => {
		it('returns the expected serialized error properties', () => {
			const error = ['mock', 'message'];
			expect(serializeError(error)).toMatchObject({
				name: 'Error',
				code: 'UNKNOWN',
				message: 'mock,message',
				isOperational: false,
				relatesToSystems: [],
				cause: null,
				stack: null,
				statusCode: null,
				data: {}
			});
		});
	});
});
