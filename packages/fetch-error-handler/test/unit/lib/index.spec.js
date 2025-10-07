jest.mock('../../../lib/create-handler', () =>
	jest.fn().mockReturnValue('mock-handler')
);
const createHandler = require('../../../lib/create-handler');

const { createFetchErrorHandler, handleFetchErrors } = require('../../..');

describe('@dotcom-reliability-kit/fetch-error-handler', () => {
	it('creates a fetch error handler', () => {
		expect(createHandler).toHaveBeenCalledTimes(1);
		expect(createHandler).toHaveBeenCalledWith();
	});

	describe('.createFetchErrorHandler', () => {
		it('aliases lib/create-handler', () => {
			expect(createFetchErrorHandler).toStrictEqual(createHandler);
		});
	});

	describe('.handleFetchErrors', () => {
		it('is the created fetch error handler', () => {
			expect(handleFetchErrors).toStrictEqual('mock-handler');
		});
	});
});
