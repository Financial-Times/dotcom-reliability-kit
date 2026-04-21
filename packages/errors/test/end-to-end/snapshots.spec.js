import { describe, it } from 'node:test';
import errors from './errors.js';

describe('@dotcom-reliability-kit/errors end-to-end', () => {
	for (const [name, error] of Object.entries(errors)) {
		describe(name, () => {
			it('matches the snapshot', (test) => {
				const expectedError = {
					name: error.name,
					isOperational: error.isOperational,
					code: error.code,
					data: error.data,
					relatesToSystems: error.relatesToSystems,
					statusCode: error.statusCode,
					statusMessage: error.statusMessage,
					message: error.message
				};
				if (error.cause) {
					expectedError.cause = {
						message: error.cause.message,
						name: error.cause.name
					};
				}
				test.assert.snapshot(expectedError);
			});
		});
	}
});
