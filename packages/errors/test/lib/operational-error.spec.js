const OperationalError = require('../../lib/operational-error');

describe('@dotcom-reliability-kit/errors/lib/operationa-error', () => {
	it('exports a class', () => {
		expect(OperationalError).toBeInstanceOf(Function);
		expect(() => {
			// @ts-ignore TypeScript will not allow us to use a class constructor like this
			OperationalError();
		}).toThrow(/class constructor/i);
	});

	it('extends the global Error class', () => {
		expect(OperationalError.prototype).toBeInstanceOf(Error);
	});

	describe('new OperationalError(message)', () => {
		/** @type {OperationalError} */
		let instance;

		beforeEach(() => {
			instance = new OperationalError('mock message');
		});

		describe('.name', () => {
			it('is set to "OperationalError"', () => {
				expect(instance.name).toStrictEqual('OperationalError');
			});
		});

		describe('.isOperational', () => {
			it('is set to true', () => {
				expect(instance.isOperational).toStrictEqual(true);
			});
		});

		describe('.message', () => {
			it('is set to the passed in message parameter', () => {
				expect(instance.message).toStrictEqual('mock message');
			});
		});
	});

	describe('isErrorMarkedAsOperational(error)', () => {
		describe('when called with an OperationalError instance', () => {
			it('returns `true`', () => {
				expect(
					OperationalError.isErrorMarkedAsOperational(
						new OperationalError('mock message')
					)
				).toStrictEqual(true);
			});
		});

		describe('when called with an Error instance', () => {
			it('returns `false`', () => {
				expect(
					OperationalError.isErrorMarkedAsOperational(new Error('mock message'))
				).toStrictEqual(false);
			});
		});

		describe('when called with an Error instance that has a manually added `isOperational` property', () => {
			it('returns `true`', () => {
				const error = new Error('mock message');
				// @ts-ignore Fine to add additonal properties for testing purposes
				error.isOperational = true;
				expect(
					OperationalError.isErrorMarkedAsOperational(error)
				).toStrictEqual(true);
			});
		});
	});
});
