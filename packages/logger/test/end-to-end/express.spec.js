const express = require('express');
const logger = require('../..');

const PORT = 13700;
const BASE_URL = `http://localhost:${PORT}`;

describe('testing jest exit', () => {
	/** @type {express.Application} */
	let app;

	/** @type {import('node:http').Server} */
	let server;

	beforeAll((done) => {
		app = express();
		app.get('/', (request, response) => {
			logger.debug('this is debug');
			logger.info('this is info');
			logger.warn('this is warn');
			logger.error('this is error');
			response.send('ok');
		});
		server = app.listen(PORT, done);
	});

	afterAll((done) => {
		server.close(done);
	});

	it('is OK', async () => {
		const response = await fetch(BASE_URL);
		expect(response.ok).toBe(true);
	});
});
