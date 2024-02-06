import appInfo from '@dotcom-reliability-kit/app-info';
import { environment } from '@dotcom-reliability-kit/app-info';
import logger1 from '@dotcom-reliability-kit/logger';
import * as logger2 from '@dotcom-reliability-kit/logger';
import { Logger, transforms } from '@dotcom-reliability-kit/logger';
import serializeError from '@dotcom-reliability-kit/serialize-error';
import serializeRequest from '@dotcom-reliability-kit/serialize-request';

// Test that appInfo types work
if (appInfo.environment !== environment) {
	throw new Error('appInfo is not working');
}

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

// Test that error and request serialization works.
// See: https://github.com/Financial-Times/cp-content-pipeline/blob/90ce06158b65742cd03cbf03f5372790906cad9e/packages/api/src/plugins/logging.ts#L1-L3
serializeError(new Error('hi'));
serializeRequest({ url: 'https://example.com' });

console.log('OK');
