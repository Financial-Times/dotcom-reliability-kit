const appInfo = require('@dotcom-reliability-kit/app-info');
const { environment } = require('@dotcom-reliability-kit/app-info');
const logger1 = require('@dotcom-reliability-kit/logger');
const logger2 = require('@dotcom-reliability-kit/logger').default;
const { Logger, transforms } = require('@dotcom-reliability-kit/logger');
const serializeError = require('@dotcom-reliability-kit/serialize-error');
const serializeRequest = require('@dotcom-reliability-kit/serialize-request');

// Test that appInfo types work
if (appInfo.environment !== environment) {
	throw new Error('appInfo is not working');
}

/**
 * @typedef {object} TypeTests
 * @property {Logger} logger1
 * @property {Logger} logger2
 */
module.exports = {
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
