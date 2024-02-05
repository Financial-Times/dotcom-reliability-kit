const logger1 = require('@dotcom-reliability-kit/logger');
const logger2 = require('@dotcom-reliability-kit/logger').default;
const { Logger, transforms } = require('@dotcom-reliability-kit/logger');
const serializeRequest = require('@dotcom-reliability-kit/serialize-request');

type TypeTests = {
	// @ts-ignore TODO this isn't working correctly and we'll need
	// to rethink the way we build our type definitions in order to
	// support TypeScript written as CommonJS properly.
	logger1: Logger;

	// @ts-ignore TODO this isn't working correctly and we'll need
	// to rethink the way we build our type definitions in order to
	// support TypeScript written as CommonJS properly.
	logger2: Logger;
};

module.exports = {
	// These test that the default logger exports
	// are instances of the Logger export
	logger1,
	logger2
} as TypeTests;

// Test that a logger can be constructed
new Logger({
	transforms: [transforms.legacyMask()]
});

// Test that request serialization works.
// See: https://github.com/Financial-Times/cp-content-pipeline/blob/90ce06158b65742cd03cbf03f5372790906cad9e/packages/api/src/plugins/logging.ts#L1-L3
serializeRequest({ url: 'https://example.com' });

console.log('OK');
