import appInfo from '@dotcom-reliability-kit/app-info';
import { environment } from '@dotcom-reliability-kit/app-info';
import logger1 from '@dotcom-reliability-kit/logger';
import * as logger2 from '@dotcom-reliability-kit/logger';
import { Logger, transforms } from '@dotcom-reliability-kit/logger';
import serializeError from '@dotcom-reliability-kit/serialize-error';
import serializeRequest from '@dotcom-reliability-kit/serialize-request';

/**
 * @typedef {object} TypeTests
 * @property {Logger} logger1
 * @property {Logger} logger2
 * @property {string} environment1
 * @property {string} environment2
 */

/** @type {TypeTests} */
const result = {
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

// @ts-ignore TODO this isn't working correctly and we'll need
// to rethink the way we build our type definitions in order to
// support TypeScript written as ESM properly.
serializeRequest({ url: 'https://example.com' });

console.log('OK');
