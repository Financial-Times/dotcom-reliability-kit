const errors = require('../..');

jest.mock('../../lib/operational-error', () => 'mock-operational-error');

describe('@dotcom-reliability-kit/errors', () => {
	it('exports an object', () => {
		expect(errors).toBeInstanceOf(Object);
	});

	describe('.OperationalError', () => {
		it('aliases lib/operational-error', () => {
			expect(errors.OperationalError).toStrictEqual('mock-operational-error');
		});
	});
});
