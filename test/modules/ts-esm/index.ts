import appInfo from '@dotcom-reliability-kit/app-info';
import { environment } from '@dotcom-reliability-kit/app-info';
import logger1 from '@dotcom-reliability-kit/logger';
import * as logger2 from '@dotcom-reliability-kit/logger';
import { Logger, transforms } from '@dotcom-reliability-kit/logger';
import serializeError from '@dotcom-reliability-kit/serialize-error';
import serializeRequest from '@dotcom-reliability-kit/serialize-request';
import registerCrashHandler from '@dotcom-reliability-kit/crash-handler';
import renderErrorInfoPage from '@dotcom-reliability-kit/middleware-render-error-info';

type TypeTests = {
	logger1: Logger;
	logger2: Logger;
	environment1: string;
	environment2: string;
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
export default result;

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
