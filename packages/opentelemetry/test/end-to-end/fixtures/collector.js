const express = require('express');
const logger = require('@dotcom-reliability-kit/logger');

const app = express();

app.use(express.raw({ type: 'application/x-protobuf' }));

app.use(async (request, response) => {
	try {
		logger.info({
			event: 'INCOMING_REQUEST',
			method: request.method,
			url: request.url,
			headers: request.headers,
			body: request.body.toString()
		});
		response.status(200).send('');
	} catch (error) {
		logger.error(error);
		response.status(500).send('');
	}
});

const server = app.listen((error) => {
	if (error) {
		logger.fatal(`Collector could not be started: ${error.message}`);
		return process.exit(1);
	}
	if (process.send) {
		process.send({
			ready: true,
			port: server.address().port
		});
	}
});
