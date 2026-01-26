const { describe, it, mock } = require('node:test');
const assert = require('node:assert/strict');

const root = '../../../lib';
mock.module(`${root}/base-error.js`, { defaultExport: 'mock-base-error' });
mock.module(`${root}/data-store-error.js`, { defaultExport: 'mock-data-store-error' });
mock.module(`${root}/http-error.js`, { defaultExport: 'mock-http-error' });
mock.module(`${root}/operational-error.js`, { defaultExport: 'mock-operational-error' });
mock.module(`${root}/upstream-service-error.js`, { defaultExport: 'mock-upstream-service-error' });
mock.module(`${root}/user-input-error.js`, { defaultExport: 'mock-user-input-error' });

const errors = require('@dotcom-reliability-kit/errors');

describe('@dotcom-reliability-kit/errors', () => {
	describe('.default', () => {
		it('aliases the module exports', () => {
			assert.strictEqual(errors.default, errors);
		});
	});

	describe('.BaseError', () => {
		it('aliases lib/base-error', () => {
			assert.strictEqual(errors.BaseError, 'mock-base-error');
		});
	});

	describe('.DataStoreError', () => {
		it('aliases lib/data-store-error', () => {
			assert.strictEqual(errors.DataStoreError, 'mock-data-store-error');
		});
	});

	describe('.HttpError', () => {
		it('aliases lib/http-error', () => {
			assert.strictEqual(errors.HttpError, 'mock-http-error');
		});
	});

	describe('.OperationalError', () => {
		it('aliases lib/operational-error', () => {
			assert.strictEqual(errors.OperationalError, 'mock-operational-error');
		});
	});

	describe('.UpstreamServiceError', () => {
		it('aliases lib/upstream-service-error', () => {
			assert.strictEqual(errors.UpstreamServiceError, 'mock-upstream-service-error');
		});
	});

	describe('.UserInputError', () => {
		it('aliases lib/user-input-error', () => {
			assert.strictEqual(errors.UserInputError, 'mock-user-input-error');
		});
	});
});
