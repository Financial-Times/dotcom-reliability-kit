const { describe, it } = require('node:test');

const errors = require('./errors');

describe('@dotcom-reliability-kit/errors end-to-end', () => {
	for (const [name, error] of Object.entries(errors)) {
		describe(name, () => {
			it('matches the snapshot', (test) => {
				const expectedError = { ...error, message: error.message };
				if (error.cause) {
					expectedError.cause = error.cause;
				}
				test.assert.snapshot(expectedError);
			});
		});
	}
});
