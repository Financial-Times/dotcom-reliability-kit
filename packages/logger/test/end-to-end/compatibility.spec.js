const cleanLogForTesting = require('./helpers/clean-log-for-testing');
const { exec } = require('child_process');
const findLogWithPropertyValue = require('./helpers/find-log-with-property-value');
const testCases = require('./compatibility-test-cases');
const splitAndParseJsonLogs = require('./helpers/split-and-parse-json-logs');

describe('@dotcom-reliability-kit/logger vs @financial-times/n-logger', () => {
	const loggingScript = `${__dirname}/scripts/run-loggers-with-test-case.js`;

	for (const { id, description, expectedOutput } of testCases) {
		describe(description, () => {
			let logs;

			beforeAll((done) => {
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
					expect(log).toBeTruthy();
					const cleanLog = cleanLogForTesting(log);
					expect(cleanLog).toEqual(expectedOutput.nextLogger);
				});
			}

			if (expectedOutput.nextMaskLogger) {
				it('outputs the expected n-mask-logger logs', () => {
					const log = findLogWithPropertyValue(
						logs,
						'_logger',
						'nextMaskLogger'
					);
					expect(log).toBeTruthy();
					const cleanLog = cleanLogForTesting(log);
					expect(cleanLog).toEqual(expectedOutput.nextMaskLogger);
				});
			}

			if (expectedOutput.reliabilityKit) {
				it('outputs the expected reliability-kit logs', () => {
					const log = findLogWithPropertyValue(
						logs,
						'_logger',
						'reliabilityKit'
					);
					expect(log).toBeTruthy();
					const cleanLog = cleanLogForTesting(log);
					expect(cleanLog).toEqual(expectedOutput.reliabilityKit);
				});
			}

			if (expectedOutput.reliabilityKitMaskLogger) {
				it('outputs the expected reliability-kit masked logs', () => {
					const log = findLogWithPropertyValue(
						logs,
						'_logger',
						'reliabilityKitMaskLogger'
					);
					expect(log).toBeTruthy();
					const cleanLog = cleanLogForTesting(log);
					expect(cleanLog).toEqual(expectedOutput.reliabilityKitMaskLogger);
				});
			}

			if (expectedOutput.deprecation) {
				it('outputs a deprecation message', () => {
					const log = findLogWithPropertyValue(
						logs,
						'event',
						'LOG_LEVEL_DEPRECATED'
					);
					expect(log).toBeTruthy();
					const cleanLog = cleanLogForTesting(log);
					expect(cleanLog).toEqual(expectedOutput.deprecation);
				});
			}
		});
	}
});
