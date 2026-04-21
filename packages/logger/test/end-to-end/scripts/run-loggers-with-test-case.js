import nLogger from '@financial-times/n-logger';
import reliabilityKitLogger, { Logger, transforms } from '../../../lib/index.js';
import testCases from '../compatibility-test-cases.js';

const reliabilityKitMaskLogger = new Logger({
	transforms: [transforms.legacyMask()]
});

// The test case ID is passed as an additional argument on the command.
// We use this to find the test case in order to perform logging.
const testCase = testCases.find(({ id }) => id === process.argv[2]);
if (!testCase) {
	process.exit(1);
}

const { method, args } = testCase.call;

// Run n-logger
if (nLogger.default[method]) {
	nLogger.default[method](...args, { _logger: 'nextLogger' });
}

// Run reliability kit logger
if (reliabilityKitLogger[method]) {
	reliabilityKitLogger[method](...args, { _logger: 'reliabilityKit' });
}

// Run reliability kit masked logger
if (reliabilityKitMaskLogger[method]) {
	reliabilityKitMaskLogger[method](...args, {
		_logger: 'reliabilityKitMaskLogger'
	});
}
