const errors = require('../..');

jest.mock('../../lib/http-error', () => 'mock-http-error');
jest.mock('../../lib/operational-error', () => 'mock-operational-error');

describe('@dotcom-reliability-kit/errors', () => {
	it('exports an object', () => {
		expect(errors).toBeInstanceOf(Object);
	});

	describe('.HttpError', () => {
		it('aliases lib/http-error', () => {
			expect(errors.HttpError).toStrictEqual('mock-http-error');
		});
	});

	describe('.OperationalError', () => {
		it('aliases lib/operational-error', () => {
			expect(errors.OperationalError).toStrictEqual('mock-operational-error');
		});
	});
});
