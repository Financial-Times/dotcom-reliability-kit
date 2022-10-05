// These environment variables are required to make n-logger
// output JSON logs which can be tested against Reliability Kit
process.env.MIGRATE_TO_HEROKU_LOG_DRAINS = 'true';
process.env.SPLUNK_LOG_LEVEL = 'silly';

const nLogger = require('@financial-times/n-logger').default;
const reliabilityKitLogger = require('../../../lib').default;
const testCases = require('../compatibility-test-cases');

// The test case ID is passed as an additional argument on the command.
// We use this to find the test case in order to perform logging.
const testCase = testCases.find(({ id }) => id === process.argv[2]);
if (!testCase) {
	process.exit(1);
}

const { method, args } = testCase.call;

// Run n-logger
if (nLogger[method]) {
	nLogger[method](...args, { _logger: 'nextLogger' });
}

// Run reliability kit logger
if (reliabilityKitLogger[method]) {
	reliabilityKitLogger[method](...args, { _logger: 'reliabilityKit' });
}
