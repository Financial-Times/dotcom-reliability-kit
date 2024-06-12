jest.mock('@dotcom-reliability-kit/app-info', () => ({
	semanticConventions: {
		service: {
			name: 'mock-service-name',
			version: 'mock-service-version',
			instance: {
				id: 'mock-service-instance-id'
			}
		},
		cloud: {
			provider: 'mock-cloud-provider',
			region: 'mock-cloud-region'
		},
		deployment: {
			environment: 'mock-deployment-environment'
		}
	}
}));
jest.mock('@opentelemetry/sdk-node');
jest.mock('@opentelemetry/semantic-conventions', () => ({
	SEMRESATTRS_CLOUD_PROVIDER: 'mock-semresattrs-cloud-provider',
	SEMRESATTRS_CLOUD_REGION: 'mock-semresattrs-cloud-region',
	SEMRESATTRS_DEPLOYMENT_ENVIRONMENT: 'mock-semresattrs-deployment-environment',
	SEMRESATTRS_SERVICE_NAME: 'mock-semresattrs-service-name',
	SEMRESATTRS_SERVICE_VERSION: 'mock-semresattrs-service-version',
	SEMRESATTRS_SERVICE_INSTANCE_ID: 'mock-semresattrs-service-instance-id'
}));

const { Resource } = require('@opentelemetry/sdk-node').resources;
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
				'mock-semresattrs-deployment-environment':
					'mock-deployment-environment',
				'mock-semresattrs-service-name': 'mock-service-name',
				'mock-semresattrs-service-version': 'mock-service-version',
				'mock-semresattrs-service-instance-id': 'mock-service-instance-id'
			});
			expect(resource).toStrictEqual(Resource.mock.instances[0]);
		});
	});
});
