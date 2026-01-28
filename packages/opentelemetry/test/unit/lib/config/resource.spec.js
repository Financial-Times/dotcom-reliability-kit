const { beforeEach, describe, it, mock } = require('node:test');
const assert = require('node:assert/strict');

const appInfo = {
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
};
mock.module('@dotcom-reliability-kit/app-info', { defaultExport: appInfo });

const defaultResource = mock.fn(() => ({ merge: mock.fn(() => 'mock-merged-resource') }));
const resourceFromAttributes = mock.fn(() => 'mock-resource');
mock.module('@opentelemetry/sdk-node', {
	defaultExport: { resources: { defaultResource, resourceFromAttributes } }
});

mock.module('@opentelemetry/semantic-conventions', {
	namedExports: {
		ATTR_SERVICE_NAME: 'mock-semresattrs-service-name',
		ATTR_SERVICE_VERSION: 'mock-semresattrs-service-version'
	}
});

const { createResourceConfig } = require('../../../../lib/config/resource.js');

describe('@dotcom-reliability-kit/opentelemetry/lib/config/resource', () => {
	it('exports a function', () => {
		assert.strictEqual(typeof createResourceConfig, 'function');
	});

	describe('createResourceConfig()', () => {
		let resource;

		beforeEach(() => {
			resource = createResourceConfig();
		});

		it('creates and returns an OpenTelemetry Resource, merging it with defaults', () => {
			assert.strictEqual(resourceFromAttributes.mock.callCount(), 1);
			assert.deepStrictEqual(resourceFromAttributes.mock.calls[0].arguments, [
				{
					'cloud.provider': 'mock-cloud-provider',
					'cloud.region': 'mock-cloud-region',
					'deployment.environment': 'mock-deployment-environment',
					'mock-semresattrs-service-name': 'mock-service-name',
					'mock-semresattrs-service-version': 'mock-service-version',
					'service.instance.id': 'mock-service-instance-id'
				}
			]);
			assert.strictEqual(defaultResource.mock.callCount(), 1);
			assert.deepStrictEqual(
				defaultResource.mock.calls[0].result.merge.mock.calls[0].arguments,
				['mock-resource']
			);
			assert.strictEqual(resource, 'mock-merged-resource');
		});
	});
});
