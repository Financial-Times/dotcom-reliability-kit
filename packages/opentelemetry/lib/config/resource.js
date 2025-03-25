const appInfo = require('@dotcom-reliability-kit/app-info').semanticConventions;
const { resourceFromAttributes } = require('@opentelemetry/sdk-node').resources;
const {
	ATTR_SERVICE_NAME,
	ATTR_SERVICE_VERSION
} = require('@opentelemetry/semantic-conventions');

/**
 * @import { resources } from '@opentelemetry/sdk-node'
 */

// These are hard-coded because they're unstable and OpenTelemetry advices we do this:
// https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv
const ATTR_CLOUD_PROVIDER = 'cloud.provider';
const ATTR_CLOUD_REGION = 'cloud.region';
const ATTR_DEPLOYMENT_ENVIRONMENT = 'deployment.environment';
const ATTR_SERVICE_INSTANCE_ID = 'service.instance.id';

/**
 * Create a Resource object using gathered app info.
 *
 * @returns {resources.Resource}
 */
exports.createResourceConfig = function createResourceConfig() {
	// We set OpenTelemetry resource attributes based on app data
	return resourceFromAttributes({
		[ATTR_SERVICE_NAME]: appInfo.service.name,
		[ATTR_SERVICE_VERSION]: appInfo.service.version,
		[ATTR_SERVICE_INSTANCE_ID]: appInfo.service.instance.id,
		[ATTR_CLOUD_PROVIDER]: appInfo.cloud.provider,
		[ATTR_CLOUD_REGION]: appInfo.cloud.region,
		[ATTR_DEPLOYMENT_ENVIRONMENT]: appInfo.deployment.environment
	});
};
