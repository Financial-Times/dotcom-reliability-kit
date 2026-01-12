const { fork } = require('node:child_process');
const { setTimeout } = require('node:timers/promises');

describe('@dotcom-reliability-kit/middleware-log-errors end-to-end', () => {
	let child;
	let stdout = '';
	let baseUrl;

	beforeAll((done) => {
		child = fork(`${__dirname}/fixtures/app.js`, {
			stdio: 'pipe',
			env: {
				...process.env,
				HEROKU_RELEASE_CREATED_AT: 'mock-release-date',
				HEROKU_SLUG_COMMIT: 'mock-commit-hash',
				LOG_LEVEL: 'debug',
				MIGRATE_TO_HEROKU_LOG_DRAINS: 'true',
				NODE_ENV: 'production',
				REGION: 'mock-region',
				SYSTEM_CODE: 'reliability-kit/middleware-log-errors'
			}
		});
		child.stdout.on('data', (chunk) => {
			stdout += chunk.toString();
		});
		child.stderr.on('data', (chunk) => {
			stdout += chunk.toString();
		});
		child.on('message', (message) => {
			if (message?.ready) {
				baseUrl = `http://localhost:${message.port}`;
				done();
			}
		});
	});

	afterAll(() => {
		child.kill('SIGINT');
	});

	describe('GET /error', () => {
		beforeAll(async () => {
			await fetch(`${baseUrl}/error`);

			// Pino uses async logs so we can't guarantee that our log will have been output
			// immediately. We wait a total of 5s for the log to come through, checking for
			// the log in 100ms increments
			let waitTime = 0;
			while (waitTime < 5000) {
				if (stdout.includes('HANDLED_ERROR')) {
					return;
				}
				waitTime += 100;
				await setTimeout(100);
			}
			throw new Error('HANDLED_ERROR log took too long to come through');
		});

		it('logs error information to stdout', () => {
			const jsonLogs = stdout.split('\n').map((line) => {
				try {
					return JSON.parse(line);
				} catch (_) {
					return {};
				}
			});
			const handledErrors = jsonLogs.filter((log) => log.event === 'HANDLED_ERROR');
			expect(handledErrors).toHaveLength(1);
			expect(handledErrors[0].error).toMatchObject({
				cause: null,
				code: 'UNKNOWN',
				data: {},
				isOperational: false,
				message: 'example error',
				name: 'Error',
				relatesToSystems: [],
				stack: 'mock stack',
				statusCode: null
			});
			expect(handledErrors[0].request).toMatchObject({
				headers: {
					accept: '*/*'
				},
				id: null,
				method: 'GET',
				route: {
					params: {},
					path: '/error'
				},
				url: '/error'
			});
			expect(handledErrors[0].app).toMatchObject({
				commit: 'mock-commit-hash',
				name: 'reliability-kit/middleware-log-errors',
				region: 'mock-region',
				releaseDate: 'mock-release-date'
			});
		});
	});

	describe('GET /error-filtered', () => {
		beforeAll(async () => {
			await fetch(`${baseUrl}/error-filtered`);
		});

		it('does not log error information to stdout', () => {
			expect(stdout).not.toContain('FILTERED_ERROR');
		});
	});
});
