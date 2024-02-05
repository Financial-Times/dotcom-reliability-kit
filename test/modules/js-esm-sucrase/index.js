import logger1 from '@dotcom-reliability-kit/logger';
import * as logger2 from '@dotcom-reliability-kit/logger';
import { Logger, transforms } from '@dotcom-reliability-kit/logger';
import serializeRequest from '@dotcom-reliability-kit/serialize-request';

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

// Test that request serialization works.
// See: https://github.com/Financial-Times/cp-content-pipeline/blob/90ce06158b65742cd03cbf03f5372790906cad9e/packages/api/src/plugins/logging.ts#L1-L3
serializeRequest({ url: 'https://example.com' });

console.log('OK');
