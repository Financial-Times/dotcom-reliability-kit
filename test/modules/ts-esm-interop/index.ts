import logger1 from '@dotcom-reliability-kit/logger';
import * as logger2 from '@dotcom-reliability-kit/logger';
import { Logger, transforms } from '@dotcom-reliability-kit/logger';

type TypeTests = {
	logger1: Logger;
	logger2: Logger;
};

export default {
	// These test that the default logger exports
	// are instances of the Logger export
	logger1,
	logger2
} as TypeTests;

// Test that a logger can be constructed
new Logger({
	transforms: [transforms.legacyMask()]
});

console.log('OK');
