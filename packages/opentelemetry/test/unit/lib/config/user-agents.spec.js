jest.mock('@dotcom-reliability-kit/app-info', () => ({
	systemCode: 'mock-system-code'
}));
jest.mock('../../../../package.json', () => ({
	name: 'mock-package',
	version: '1.2.3'
}));
jest.mock('@opentelemetry/exporter-metrics-otlp-proto/package.json', () => ({
	name: 'mock-otel-metrics-package',
	version: '3.4.5'
}));
jest.mock('@opentelemetry/exporter-trace-otlp-proto/package.json', () => ({
	name: 'mock-otel-tracing-package',
	version: '6.7.8'
}));

const { METRICS_USER_AGENT, TRACING_USER_AGENT } = require('../../../../lib/config/user-agents');

describe('@dotcom-reliability-kit/opentelemetry/lib/config/resource', () => {
	describe('.METRICS_USER_AGENT', () => {
		it('is set based on app info and package versions', () => {
			expect(METRICS_USER_AGENT).toStrictEqual(
				'FTSystem/mock-system-code (mock-package/1.2.3) (mock-otel-metrics-package/3.4.5)'
			);
		});
	});

	describe('.TRACING_USER_AGENT', () => {
		it('is set based on app info and package versions', () => {
			expect(TRACING_USER_AGENT).toStrictEqual(
				'FTSystem/mock-system-code (mock-package/1.2.3) (mock-otel-tracing-package/6.7.8)'
			);
		});
	});
});
