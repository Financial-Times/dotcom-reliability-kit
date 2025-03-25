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
jest.mock('@opentelemetry/sdk-node', () => ({
	resources: {
		resourceFromAttributes: jest.fn().mockReturnValue('mock-resource')
	}
}));
jest.mock('@opentelemetry/semantic-conventions', () => ({
	ATTR_SERVICE_NAME: 'mock-semresattrs-service-name',
	ATTR_SERVICE_VERSION: 'mock-semresattrs-service-version'
}));

const { resourceFromAttributes } = require('@opentelemetry/sdk-node').resources;
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
			expect(resourceFromAttributes).toHaveBeenCalledTimes(1);
			expect(resourceFromAttributes).toHaveBeenCalledWith({
				'cloud.provider': 'mock-cloud-provider',
				'cloud.region': 'mock-cloud-region',
				'deployment.environment': 'mock-deployment-environment',
				'mock-semresattrs-service-name': 'mock-service-name',
				'mock-semresattrs-service-version': 'mock-service-version',
				'service.instance.id': 'mock-service-instance-id'
			});
			expect(resource).toStrictEqual('mock-resource');
		});
	});
});
