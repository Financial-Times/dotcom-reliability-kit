const appInfo = require('@dotcom-reliability-kit/app-info');
const { environment } = require('@dotcom-reliability-kit/app-info');
const logger1 = require('@dotcom-reliability-kit/logger');
const logger2 = require('@dotcom-reliability-kit/logger').default;
const { Logger, transforms } = require('@dotcom-reliability-kit/logger');
const serializeError = require('@dotcom-reliability-kit/serialize-error');
const serializeRequest = require('@dotcom-reliability-kit/serialize-request');
const registerCrashHandler = require('@dotcom-reliability-kit/crash-handler');
const renderErrorInfoPage = require('@dotcom-reliability-kit/middleware-render-error-info');

type TypeTests = {
	// @ts-ignore TODO this isn't working correctly and we'll need
	// to rethink the way we build our type definitions in order to
	// support TypeScript written as CommonJS properly.
	logger1: Logger;

	// @ts-ignore TODO this isn't working correctly and we'll need
	// to rethink the way we build our type definitions in order to
	// support TypeScript written as CommonJS properly.
	logger2: Logger;
	
	// These test that appInfo can be imported either
	// as a default or named exports
	environment1: string,
	environment2: string
};

const result: TypeTests = {
	// These test that the default logger exports
	// are instances of the Logger export
	logger1,
	logger2,
	// These test that appInfo can be imported either
	// as a default or named exports
	environment1: environment,
	environment2: appInfo.environment
};
module.exports = result;

// Test that appInfo exports the correct values
if (!appInfo.environment || appInfo.environment !== environment) {
	throw new Error('appInfo is not working');
}

// Test that a logger can be constructed
new Logger({
	transforms: [transforms.legacyMask()]
});

// Test that error and request serialization works.
// See: https://github.com/Financial-Times/cp-content-pipeline/blob/90ce06158b65742cd03cbf03f5372790906cad9e/packages/api/src/plugins/logging.ts#L1-L3
serializeError(new Error('hi'));
serializeRequest({ url: 'https://example.com' });

// Test that crash handler works
registerCrashHandler({ process, logger: logger1 || logger2 });

// Test that error rendering middleware works
renderErrorInfoPage({ logger: logger1 || logger2 });

console.log('OK');
