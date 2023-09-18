const express = require('express');
const { STATUS_CODES } = require('node:http');

const app = express();

app.get('/status/:status', (request, response) => {
	setTimeout(() => {
		let status = 200;
		if (/^\d+$/.test(request.params.status)) {
			status = Number(request.params.status);
		}
		response.status(status).send(STATUS_CODES[status]);
	}, 50);
});

app.get('/hangup', (request, response) => {
	response.socket.destroy();
});

const server = app.listen(() => {
	if (process.send) {
		process.send({
			ready: true,
			port: server.address().port
		});
	}
});
