// These environment variables are required to make n-logger
// output JSON logs which can be tested against Reliability Kit
process.env.MIGRATE_TO_HEROKU_LOG_DRAINS = 'true';
process.env.SPLUNK_LOG_LEVEL = 'silly';

const nLogger = require('@financial-times/n-logger').default;
const MaskLogger = require('@financial-times/n-mask-logger');
const reliabilityKitLogger = require('../../../lib');
const testCases = require('../compatibility-test-cases');

const nMaskLogger = new MaskLogger();
const reliabilityKitMaskLogger = new reliabilityKitLogger.Logger({
	transforms: [reliabilityKitLogger.transforms.legacyMask()]
});

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

// Run n-mask-logger
if (nMaskLogger[method]) {
	nMaskLogger[method](...args, { _logger: 'nextMaskLogger' });
}

// Run reliability kit masked logger
if (reliabilityKitMaskLogger[method]) {
	reliabilityKitMaskLogger[method](...args, {
		_logger: 'reliabilityKitMaskLogger'
	});
}
