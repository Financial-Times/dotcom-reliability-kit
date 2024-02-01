import logger1 from '@dotcom-reliability-kit/logger';
import * as logger2 from '@dotcom-reliability-kit/logger';
import { Logger, transforms } from '@dotcom-reliability-kit/logger';

/**
 * @typedef {object} TypeTests
 * @property {Logger} logger1
 * @property {Logger} logger2
 */
export default {
	// These test that the default logger exports
	// are instances of the Logger export
	logger1,
	logger2
};

// Test that a logger can be constructed
new Logger({
	transforms: [transforms.legacyMask()]
});

console.log('OK');
