// Environment overrides must come before module imports
process.env.HEROKU_RELEASE_CREATED_AT = 'mock-release-date';
process.env.HEROKU_SLUG_COMMIT = 'mock-commit-hash';
process.env.MIGRATE_TO_HEROKU_LOG_DRAINS = 'true';
process.env.REGION = 'mock-region';
process.env.SYSTEM_CODE = 'reliability-kit/middleware-log-errors';

const express = require('@financial-times/n-express');
const createErrorLogger = require('@dotcom-reliability-kit/middleware-log-errors');

const app = express({
	demo: true,
	systemCode: process.env.SYSTEM_CODE || 'reliability-kit-automated-tests',
	withBackendAuthentication: false,
	withServiceMetrics: false
});

app.get('/error', () => {
	const error = new Error('example error');
	error.stack = 'mock stack';
	throw error;
});

app.get('/error-filtered', () => {
	const error = new Error('example filtered error');
	error.stack = 'mock stack';
	error.code = 'FILTERED_ERROR';
	throw error;
});

app.use(
	createErrorLogger({
		filter: (error) => {
			if (error?.code === 'FILTERED_ERROR') {
				return false;
			}
			return true;
		}
	})
);

app.listen(undefined).then((server) => {
	if (process.send) {
		process.send({
			ready: true,
			// @ts-ignore
			port: server.address().port
		});
	}
});
