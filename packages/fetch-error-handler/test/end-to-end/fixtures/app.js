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

app.get('/body/json/valid', (_, response) => {
	setTimeout(() => {
		response
			.status(500)
			.set('Content-Type', 'application/json')
			.send({ json: true });
	}, 50);
});

app.get('/body/json/invalid', (_, response) => {
	setTimeout(() => {
		response.status(200).set('Content-Type', 'application/json').send('{json:');
	}, 50);
});

app.get('/body/text/invalid', (_, response) => {
	setTimeout(() => {
		response
			.status(200)
			.setHeader('Content-Encoding', 'gzip')
			.setHeader('Content-Type', 'text/plain')
			.send('something');
	}, 50);
});

app.get('/body/text/long', (_, response) => {
	setTimeout(() => {
		response
			.status(500)
			.set('Content-Type', 'text/plain')
			.send(Array(5000).fill('a').join(''));
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
