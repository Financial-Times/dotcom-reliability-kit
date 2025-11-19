const errors = require('./errors');

describe('@dotcom-reliability-kit/errors end-to-end', () => {
	for (const [name, error] of Object.entries(errors)) {
		describe(name, () => {
			it('matches the snapshot', () => {
				const expectedError = { ...error, message: error.message };
				if (error.cause) {
					expectedError.cause = error.cause;
				}
				expect(expectedError).toMatchSnapshot();
			});
		});
	}
});
