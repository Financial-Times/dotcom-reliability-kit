jest.mock('@dotcom-reliability-kit/app-info', () => ({
	systemCode: 'mock-system-code',
	releaseVersion: 'mock-release-version',
	cloudProvider: 'mock-cloud-provider',
	region: 'mock-cloud-region',
	environment: 'mock-environment'
}));
jest.mock('@opentelemetry/resources');
jest.mock('@opentelemetry/semantic-conventions', () => ({
	SEMRESATTRS_CLOUD_PROVIDER: 'mock-semresattrs-cloud-provider',
	SEMRESATTRS_CLOUD_REGION: 'mock-semresattrs-cloud-region',
	SEMRESATTRS_DEPLOYMENT_ENVIRONMENT: 'mock-semresattrs-deployment-environment',
	SEMRESATTRS_SERVICE_NAME: 'mock-semresattrs-service-name',
	SEMRESATTRS_SERVICE_VERSION: 'mock-semresattrs-service-version'
}));

const appInfo = require('@dotcom-reliability-kit/app-info');
const { Resource } = require('@opentelemetry/resources');
const { createResourceConfig } = require('../../../../lib/config/resource');

describe('@dotcom-reliability-kit/opentelemetry/lib/config/resource', () => {
	it('exports a function', () => {
		expect(typeof createResourceConfig).toBe('function');
	});

	describe('createResourceConfig()', () => {
		let resource;

		beforeEach(() => {
			resource = createResourceConfig();
		});

		it('creates and returns an OpenTelemetry Resource', () => {
			expect(Resource).toHaveBeenCalledTimes(1);
			expect(Resource).toHaveBeenCalledWith({
				'mock-semresattrs-cloud-provider': 'mock-cloud-provider',
				'mock-semresattrs-cloud-region': 'mock-cloud-region',
				'mock-semresattrs-deployment-environment': 'mock-environment',
				'mock-semresattrs-service-name': 'mock-system-code',
				'mock-semresattrs-service-version': 'mock-release-version'
			});
			expect(resource).toStrictEqual(Resource.mock.instances[0]);
		});

		describe('when any appInfo properties are falsy', () => {
			let resource;

			beforeEach(() => {
				Resource.mockClear();
				appInfo.systemCode = null;
				appInfo.releaseVersion = null;
				appInfo.cloudProvider = null;
				appInfo.region = null;
				appInfo.environment = null;
				resource = createResourceConfig();
			});

			it('creates and returns an OpenTelemetry Resource with properties set to `undefined`', () => {
				expect(Resource).toHaveBeenCalledTimes(1);
				expect(Resource).toHaveBeenCalledWith({
					'mock-semresattrs-cloud-provider': undefined,
					'mock-semresattrs-cloud-region': undefined,
					'mock-semresattrs-deployment-environment': undefined,
					'mock-semresattrs-service-name': undefined,
					'mock-semresattrs-service-version': undefined
				});
				expect(resource).toStrictEqual(Resource.mock.instances[0]);
			});
		});
	});
});
