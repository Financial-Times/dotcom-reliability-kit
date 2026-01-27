const { before, describe, it } = require('node:test');
const assert = require('node:assert/strict');
const cleanLogForTesting = require('./helpers/clean-log-for-testing');
const { exec } = require('node:child_process');
const findLogWithPropertyValue = require('./helpers/find-log-with-property-value');
const testCases = require('./compatibility-test-cases');
const splitAndParseJsonLogs = require('./helpers/split-and-parse-json-logs');

describe('@dotcom-reliability-kit/logger vs @financial-times/n-logger', () => {
	const loggingScript = `${__dirname}/scripts/run-loggers-with-test-case.js`;

	for (const { id, description, expectedOutput } of testCases) {
		describe(description, () => {
			let logs;

			before((_, done) => {
				// Execute a child process which performs logging with both
				// n-logger and Reliability Kit
				exec(`node ${loggingScript} ${id}`, (execError, stdout, stderr) => {
					if (execError) {
						return done(execError);
					}
					try {
						logs = splitAndParseJsonLogs(`${stdout}\n${stderr}`);
						done();
					} catch (error) {
						done(error);
					}
				});
			});

			if (expectedOutput.nextLogger) {
				it('outputs the expected n-logger logs', () => {
					const log = findLogWithPropertyValue(logs, '_logger', 'nextLogger');
					assert.ok(log);
					const cleanLog = cleanLogForTesting(log);
					assert.deepStrictEqual(cleanLog, expectedOutput.nextLogger);
				});
			}

			if (expectedOutput.reliabilityKit) {
				it('outputs the expected reliability-kit logs', () => {
					const log = findLogWithPropertyValue(logs, '_logger', 'reliabilityKit');
					assert.ok(log);
					const cleanLog = cleanLogForTesting(log);
					assert.deepStrictEqual(cleanLog, expectedOutput.reliabilityKit);
				});
			}

			if (expectedOutput.reliabilityKitMaskLogger) {
				it('outputs the expected reliability-kit masked logs', () => {
					const log = findLogWithPropertyValue(
						logs,
						'_logger',
						'reliabilityKitMaskLogger'
					);
					assert.ok(log);
					const cleanLog = cleanLogForTesting(log);
					assert.deepStrictEqual(cleanLog, expectedOutput.reliabilityKitMaskLogger);
				});
			}

			if (expectedOutput.deprecation) {
				it('outputs a deprecation message', () => {
					const log = findLogWithPropertyValue(logs, 'event', 'LOG_LEVEL_DEPRECATED');
					assert.ok(log);
					const cleanLog = cleanLogForTesting(log);
					assert.deepStrictEqual(cleanLog, expectedOutput.deprecation);
				});
			}
		});
	}
});
