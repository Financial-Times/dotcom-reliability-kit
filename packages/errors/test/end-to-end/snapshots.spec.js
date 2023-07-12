const errors = require('./errors');

describe('@dotcom-reliability-kit/errors end-to-end', () => {
	for (const [name, error] of Object.entries(errors)) {
		describe(name, () => {
			it('matches the snapshot', () => {
				expect({ ...error, message: error.message }).toMatchSnapshot();
			});
		});
	}
});
