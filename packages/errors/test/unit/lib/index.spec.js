const errors = require('../../..');

jest.mock('../../../lib/data-store-error', () => 'mock-data-store-error');
jest.mock('../../../lib/http-error', () => 'mock-http-error');
jest.mock('../../../lib/operational-error', () => 'mock-operational-error');
jest.mock(
	'../../../lib/upstream-service-error',
	() => 'mock-upstream-service-error'
);
jest.mock('../../../lib/user-input-error', () => 'mock-user-input-error');

describe('@dotcom-reliability-kit/errors', () => {
	describe('.default', () => {
		it('aliases the module exports', () => {
			expect(errors.default).toStrictEqual(errors);
		});
	});

	describe('.DataStoreError', () => {
		it('aliases lib/data-store-error', () => {
			expect(errors.DataStoreError).toStrictEqual('mock-data-store-error');
		});
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

	describe('.UpstreamServiceError', () => {
		it('aliases lib/upstream-service-error', () => {
			expect(errors.UpstreamServiceError).toStrictEqual(
				'mock-upstream-service-error'
			);
		});
	});

	describe('.UserInputError', () => {
		it('aliases lib/user-input-error', () => {
			expect(errors.UserInputError).toStrictEqual('mock-user-input-error');
		});
	});
});
