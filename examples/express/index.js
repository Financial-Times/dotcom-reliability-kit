// IMPORTANT: This app isn't an example of how to correctly
// set up a Financial Times Express application – it's used
// to illustrate how to integrate Reliability Kit into an
// express app with as little boilerplate code as possible.

const express = require('@financial-times/n-express');
const createErrorLogger = require('@dotcom-reliability-kit/middleware-log-errors');
const createErrorRenderingMiddleware = require('@dotcom-reliability-kit/middleware-render-error-info');
const {
	HttpError,
	OperationalError
} = require('@dotcom-reliability-kit/errors');
const { logRecoverableError } = require('@dotcom-reliability-kit/log-error');
const { systemCode } = require('@dotcom-reliability-kit/app-info');

// Create an n-express application. Reliability Kit will work
// with any Express application but we're using n-express to
// better match our existing Customer Products apps.
const app = express({
	demo: true,
	systemCode: systemCode || 'reliability-kit-express-example',
	withBackendAuthentication: false,
	withServiceMetrics: false
});

// This home view is just there to link to the various error
// pages in this app
app.get('/', (request, response) => {
	response.send(`
		<h1>Example Express App</h1>

		<h2>HTTP Errors</h2>
		<p>These pages throw errors with HTTP status codes.</p>
		<ul>
			<li><a href="/http/500">Page throwing a 500 HTTP error</a></li>
			<li><a href="/http/503">Page throwing a 503 HTTP error</a></li>
			<li><a href="/http/400">Page throwing a 400 HTTP error</a></li>
			<li><a href="/http/403">Page throwing a 403 HTTP error</a></li>
		</ul>

		<h2>Recoverable Errors</h2>
		<p>These pages have errors which are recoverable and only visible in the logs.</p>
		<ul>
			<li><a href="/recoverable">Page throwing a recoverable error</a></li>
		</ul>
	`);
});

// This route sends an HTTP error with the given status code
app.get('/http/:statusCode', (request) => {
	throw new HttpError({
		statusCode: Number(request.params.statusCode) || 500
	});
});

// This route has a recoverable error in it
app.get('/recoverable', (request, response) => {
	try {
		throw new OperationalError({
			code: 'SOMETHING_WENT_WRONG',
			message: 'Something went wrong',
			relatesToSystems: ['example-system']
		});
	} catch (/** @type {any} */ error) {
		logRecoverableError({ error, request });
		response.send('OK');
	}
});

// Register the logging middleware
app.use(createErrorLogger());

// Register the error info page middleware
app.use(createErrorRenderingMiddleware());

app.listen(Number(process.env.PORT) || 3000);
