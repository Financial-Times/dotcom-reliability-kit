const { describe, it, mock } = require('node:test');
const assert = require('node:assert/strict');

const appInfo = { systemCode: 'mock-system-code' };
mock.module('@dotcom-reliability-kit/app-info', { defaultExport: appInfo });

mock.module('../../../../package.json', {
	defaultExport: {
		name: 'mock-package',
		version: '1.2.3'
	}
});

mock.module('@opentelemetry/exporter-metrics-otlp-proto/package.json', {
	defaultExport: {
		name: 'mock-otel-metrics-package',
		version: '3.4.5'
	}
});
mock.module('@opentelemetry/exporter-trace-otlp-proto/package.json', {
	defaultExport: {
		name: 'mock-otel-tracing-package',
		version: '6.7.8'
	}
});

const { METRICS_USER_AGENT, TRACING_USER_AGENT } = require('../../../../lib/config/user-agents.js');

describe('@dotcom-reliability-kit/opentelemetry/lib/config/resource', () => {
	describe('.METRICS_USER_AGENT', () => {
		it('is set based on app info and package versions', () => {
			assert.strictEqual(
				METRICS_USER_AGENT,
				'FTSystem/mock-system-code (mock-package/1.2.3) (mock-otel-metrics-package/3.4.5)'
			);
		});
	});

	describe('.TRACING_USER_AGENT', () => {
		it('is set based on app info and package versions', () => {
			assert.strictEqual(
				TRACING_USER_AGENT,
				'FTSystem/mock-system-code (mock-package/1.2.3) (mock-otel-tracing-package/6.7.8)'
			);
		});
	});
});
