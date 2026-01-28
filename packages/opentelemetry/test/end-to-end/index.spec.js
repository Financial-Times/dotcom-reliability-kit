const { after, before, describe, it } = require('node:test');
const assert = require('node:assert/strict');
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

	before(async () => {
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

	after(() => {
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

		before(async () => {
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
			} catch (_) {
				// biome-ignore lint/suspicious/noConsole: required for tests to work
				console.log('COLLECTOR:', stdoutToLogs(collectorStdout));
				// biome-ignore lint/suspicious/noConsole: required for tests to work
				console.log('EXPORTER:', stdoutToLogs(exporterStdout));
				throw new Error('Fetch failed, see logs');
			}
		});

		describe('exporter', () => {
			it('logs that OpenTelemetry metrics are enabled', () => {
				const log = exporterLogs.find(
					(log) => log?.event === 'OTEL_METRICS_STATUS' && log?.enabled === true
				);
				assert.notStrictEqual(log, undefined);
			});
			it('logs that OpenTelemetry tracing is enabled', () => {
				const log = exporterLogs.find(
					(log) => log?.event === 'OTEL_TRACE_STATUS' && log?.enabled === true
				);
				assert.notStrictEqual(log, undefined);
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
				assert.notStrictEqual(log, undefined);
				assert.strictEqual(log.headers['content-type'], 'application/x-protobuf');
				assert.match(log.body, /mock-system/);
			});
			it('receives traces', () => {
				const log = collectorLogs.find(
					(log) =>
						log?.event === 'INCOMING_REQUEST' &&
						log?.method === 'POST' &&
						log?.url === '/traces'
				);
				assert.notStrictEqual(log, undefined);
				assert.strictEqual(log.headers['content-type'], 'application/x-protobuf');
				assert.match(log.body, /mock-system/);
			});
		});
	});
});
