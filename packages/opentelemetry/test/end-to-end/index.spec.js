const { fork } = require('node:child_process');
const { setTimeout } = require('node:timers/promises');

function waitForBaseUrl(childProcess) {
	return new Promise((resolve) => {
		const handler = (message) => {
			if (message?.ready) {
				resolve(`http://localhost:${message.port}`);
				childProcess.off('message', handler);
			}
		};
		childProcess.on('message', handler);
	});
}

function stdoutToLogs(stdout) {
	return stdout.split('\n').map((logLine) => {
		try {
			return JSON.parse(logLine);
		} catch (_) {
			return logLine;
		}
	});
}

describe('@dotcom-reliability-kit/opentelemetry end-to-end', () => {
	let collector;
	let collectorStdout = '';
	let collectorBaseUrl;
	let exporter;
	let exporterStdout = '';
	let exporterBaseUrl;

	beforeAll(async () => {
		// Set up a mock collector
		collector = fork(`${__dirname}/fixtures/collector.js`, {
			env: {
				...process.env,
				NODE_ENV: 'production',
				SYSTEM_CODE: 'mock-system'
			},
			stdio: 'pipe'
		});
		collector.stdout.on('data', (chunk) => {
			collectorStdout += chunk.toString();
		});
		collector.stderr.on('data', (chunk) => {
			collectorStdout += chunk.toString();
		});
		collectorBaseUrl = await waitForBaseUrl(collector);

		// Set up a Node.js app that sends Opentelemetry metrics and traces
		exporter = fork(`${__dirname}/fixtures/app.js`, {
			env: {
				...process.env,
				NODE_ENV: 'production',
				OPENTELEMETRY_METRICS_ENDPOINT: `${collectorBaseUrl}/metrics`,
				OPENTELEMETRY_TRACING_ENDPOINT: `${collectorBaseUrl}/traces`,
				OPENTELEMETRY_TRACING_SAMPLE_PERCENTAGE: '100',
				SYSTEM_CODE: 'mock-system'
			},
			execArgv: ['--require', '@dotcom-reliability-kit/opentelemetry/setup'],
			stdio: 'pipe'
		});
		exporter.stdout.on('data', (chunk) => {
			exporterStdout += chunk.toString();
		});
		exporter.stderr.on('data', (chunk) => {
			exporterStdout += chunk.toString();
		});
		exporterBaseUrl = await waitForBaseUrl(exporter);
	});

	afterAll(() => {
		if (collector) {
			collector.kill('SIGINT');
		}
		if (exporter) {
			exporter.kill('SIGINT');
		}
	});

	describe('sending an HTTP request to the exporting app', () => {
		let collectorLogs;
		let exporterLogs;

		beforeAll(async () => {
			try {
				await fetch(`${exporterBaseUrl}/example`);
				// This timeout is required because we have to wait for OpenTelemetry
				// in the app to finish sending traces. This makes the test brittle
				// however I've set a much longer timeout that we need to address it.
				// The tests normally pass for me in 100ms but the 1000ms is there to
				// ensure the tests still pass on a slower machine
				await setTimeout(1000);
				collectorLogs = stdoutToLogs(collectorStdout);
				exporterLogs = stdoutToLogs(exporterStdout);
			} catch (cause) {
				// eslint-disable-next-line no-console
				console.log('COLLECTOR:', stdoutToLogs(collectorStdout));
				// eslint-disable-next-line no-console
				console.log('EXPORTER:', stdoutToLogs(exporterStdout));
				throw new Error('Fetch failed, see logs');
			}
		});

		describe('exporter', () => {
			it('logs that OpenTelemetry metrics are enabled', () => {
				const log = exporterLogs.find(
					(log) => log?.event === 'OTEL_METRICS_STATUS' && log?.enabled === true
				);
				expect(log).toBeDefined();
			});
			it('logs that OpenTelemetry tracing is enabled', () => {
				const log = exporterLogs.find(
					(log) => log?.event === 'OTEL_TRACE_STATUS' && log?.enabled === true
				);
				expect(log).toBeDefined();
			});
		});

		describe('collector', () => {
			it('receives metrics', () => {
				const log = collectorLogs.find(
					(log) =>
						log?.event === 'INCOMING_REQUEST' &&
						log?.method === 'POST' &&
						log?.url === '/metrics'
				);
				expect(log).toBeDefined();
				expect(log.headers['content-type']).toBe('application/x-protobuf');
				expect(log.body).toContain('mock-system');
			});
			it('receives traces', () => {
				const log = collectorLogs.find(
					(log) =>
						log?.event === 'INCOMING_REQUEST' &&
						log?.method === 'POST' &&
						log?.url === '/traces'
				);
				expect(log).toBeDefined();
				expect(log.headers['content-type']).toBe('application/x-protobuf');
				expect(log.body).toContain('mock-system');
			});
		});
	});
});
