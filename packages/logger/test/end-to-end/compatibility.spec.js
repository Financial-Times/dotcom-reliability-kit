import assert from 'node:assert/strict';
import { exec } from 'node:child_process';
import { before, describe, it } from 'node:test';
import testCases from './compatibility-test-cases.js';
import cleanLogForTesting from './helpers/clean-log-for-testing.js';
import findLogWithPropertyValue from './helpers/find-log-with-property-value.js';
import splitAndParseJsonLogs from './helpers/split-and-parse-json-logs.js';

describe('@dotcom-reliability-kit/logger vs @financial-times/n-logger', () => {
	const loggingScript = `${import.meta.dirname}/scripts/run-loggers-with-test-case.js`;

	for (const { id, description, expectedOutput } of testCases) {
		describe(description, () => {
			let logs;

			before((_, done) => {
				// Execute a child process which performs logging with both
				// n-logger and Reliability Kit
				exec(
					`node ${loggingScript} ${id}`,
					{
						env: {
							...process.env,
							MIGRATE_TO_HEROKU_LOG_DRAINS: 'true',
							SPLUNK_LOG_LEVEL: 'silly',
							LOG_DISABLE_PRETTIFIER: 'true'
						}
					},
					(execError, stdout, stderr) => {
						if (execError) {
							return done(execError);
						}
						try {
							logs = splitAndParseJsonLogs(`${stdout}\n${stderr}`);
							done();
						} catch (error) {
							done(error);
						}
					}
				);
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
