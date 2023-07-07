const fetch = require('node-fetch');
const { fork } = require('child_process');

describe('@dotcom-reliability-kit/middleware-log-errors end-to-end', () => {
	let child;
	let stdout = '';
	let baseUrl;

	beforeAll((done) => {
		child = fork(`${__dirname}/fixtures/app.js`, { stdio: 'pipe' });
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
		});

		it('logs error information to stdout', () => {
			const jsonLogs = stdout.split('\n').map((line) => {
				try {
					return JSON.parse(line);
				} catch (error) {
					return {};
				}
			});
			const handledErrors = jsonLogs.filter(
				(log) => log.event === 'HANDLED_ERROR'
			);
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
