const { describe, it, mock } = require('node:test');
const assert = require('node:assert/strict');

const createHandler = mock.fn(() => 'mock-handler');
mock.module('../../../lib/create-handler.js', {
	defaultExport: createHandler
});

const {
	createFetchErrorHandler,
	handleFetchErrors
} = require('@dotcom-reliability-kit/fetch-error-handler');

describe('@dotcom-reliability-kit/fetch-error-handler', () => {
	it('creates a fetch error handler', () => {
		assert.strictEqual(createHandler.mock.callCount(), 1);
		assert.deepStrictEqual(createHandler.mock.calls[0].arguments, []);
	});

	describe('.createFetchErrorHandler', () => {
		it('aliases lib/create-handler', () => {
			assert.strictEqual(createFetchErrorHandler, createHandler);
		});
	});

	describe('.handleFetchErrors', () => {
		it('is the created fetch error handler', () => {
			assert.strictEqual(handleFetchErrors, 'mock-handler');
		});
	});
});
