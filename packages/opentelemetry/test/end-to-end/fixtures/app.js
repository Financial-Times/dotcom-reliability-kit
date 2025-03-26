const express = require('express');
const logger = require('@dotcom-reliability-kit/logger');

// We set up OpenTelemetry via `--require` but this allows us to grab the same instances
const { setup } = require('@dotcom-reliability-kit/opentelemetry');
const { sdk } = setup();

const app = express();

app.use(async (request, response) => {
	logger.info({
		event: 'INCOMING_REQUEST',
		method: request.method,
		url: request.url
	});

	// This ensures that metrics and traces are flushed
	await sdk.shutdown();

	response.status(200).send('');
});

const server = app.listen((error) => {
	if (error) {
		logger.fatal(`App could not be started: ${error.message}`);
		return process.exit(1);
	}
	if (process.send) {
		process.send({
			ready: true,
			port: server.address().port
		});
	}
});
