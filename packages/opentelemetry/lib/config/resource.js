import { semanticConventions as appInfo } from '@dotcom-reliability-kit/app-info';

import { resources } from '@opentelemetry/sdk-node';
import { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION } from '@opentelemetry/semantic-conventions';

const { defaultResource, resourceFromAttributes } = resources;

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
export function createResourceConfig() {
	// We set OpenTelemetry resource attributes based on app data
	return defaultResource().merge(
		resourceFromAttributes({
			[ATTR_SERVICE_NAME]: appInfo.service.name,
			[ATTR_SERVICE_VERSION]: appInfo.service.version,
			[ATTR_SERVICE_INSTANCE_ID]: appInfo.service.instance.id,
			[ATTR_CLOUD_PROVIDER]: appInfo.cloud.provider,
			[ATTR_CLOUD_REGION]: appInfo.cloud.region,
			[ATTR_DEPLOYMENT_ENVIRONMENT]: appInfo.deployment.environment
		})
	);
}
