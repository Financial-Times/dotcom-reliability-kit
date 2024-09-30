const { fork } = require('node:child_process');
const { join: joinPath } = require('node:path');

const cwd = __dirname;
const env = {
	HEROKU_RELEASE_CREATED_AT: 'mock-release-date',
	HEROKU_SLUG_COMMIT: 'mock-commit-hash',
	LOG_LEVEL: 'debug',
	OPENTELEMETRY_METRICS_ENDPOINT: 'http://localhost:4318/v1/metrics',
	REGION: 'mock-region',
	SYSTEM_CODE: 'reliability-kit/opentelemetry'
};

const app = fork(joinPath(cwd, 'run-test-app.js'), {
	cwd,
	env,
	execArgv: ['--require', '@dotcom-reliability-kit/opentelemetry/setup']
});

app.on('close', (code) => {
	process.exit(code);
});
