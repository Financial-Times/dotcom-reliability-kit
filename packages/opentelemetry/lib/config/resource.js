const appInfo = require('@dotcom-reliability-kit/app-info');
const { Resource } = require('@opentelemetry/resources');
const {
	SEMRESATTRS_CLOUD_PROVIDER,
	SEMRESATTRS_CLOUD_REGION,
	SEMRESATTRS_DEPLOYMENT_ENVIRONMENT,
	SEMRESATTRS_SERVICE_NAME,
	SEMRESATTRS_SERVICE_VERSION
} = require('@opentelemetry/semantic-conventions');

/**
 * Create a Resource object using gathered app info.
 *
 * @returns {Resource}
 */
exports.createResourceConfig = function createResourceConfig() {
	// We set OpenTelemetry resource attributes based on app data
	return new Resource({
		[SEMRESATTRS_SERVICE_NAME]: appInfo.systemCode || undefined,
		[SEMRESATTRS_SERVICE_VERSION]: appInfo.releaseVersion || undefined,
		[SEMRESATTRS_CLOUD_PROVIDER]: appInfo.cloudProvider || undefined,
		[SEMRESATTRS_CLOUD_REGION]: appInfo.region || undefined,
		[SEMRESATTRS_DEPLOYMENT_ENVIRONMENT]: appInfo.environment || undefined
	});
};
