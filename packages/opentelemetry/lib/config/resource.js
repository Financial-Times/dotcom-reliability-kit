const appInfo = require('@dotcom-reliability-kit/app-info').semanticConventions;
const { Resource } = require('@opentelemetry/sdk-node').resources;
const {
	SEMRESATTRS_CLOUD_PROVIDER,
	SEMRESATTRS_CLOUD_REGION,
	SEMRESATTRS_DEPLOYMENT_ENVIRONMENT,
	SEMRESATTRS_SERVICE_INSTANCE_ID,
	SEMRESATTRS_SERVICE_NAME,
	SEMRESATTRS_SERVICE_VERSION
} = require('@opentelemetry/semantic-conventions');

/**
 * Create a Resource object using gathered app info.
 *
 * @returns {import('@opentelemetry/sdk-node').resources.Resource}
 */
exports.createResourceConfig = function createResourceConfig() {
	// We set OpenTelemetry resource attributes based on app data
	return new Resource({
		[SEMRESATTRS_SERVICE_NAME]: appInfo.service.name,
		[SEMRESATTRS_SERVICE_VERSION]: appInfo.service.version,
		[SEMRESATTRS_SERVICE_INSTANCE_ID]: appInfo.service.instance.id,
		[SEMRESATTRS_CLOUD_PROVIDER]: appInfo.cloud.provider,
		[SEMRESATTRS_CLOUD_REGION]: appInfo.cloud.region,
		[SEMRESATTRS_DEPLOYMENT_ENVIRONMENT]: appInfo.deployment.environment
	});
};
