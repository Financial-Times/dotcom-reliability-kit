import createErrorLogger from '@dotcom-reliability-kit/middleware-log-errors';
import express from 'express';

const app = express();

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

const server = app.listen(() => {
	if (process.send) {
		process.send({
			ready: true,
			port: server.address().port
		});
	}
});
