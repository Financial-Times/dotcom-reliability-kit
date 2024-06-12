describe('setup', () => {
	let opentelemetry;

	beforeEach(() => {
		jest.resetModules();
		jest.mock('../..', () => ({ setup: jest.fn() }));
		opentelemetry = require('../..');
	});

	it('should call opentelemetry.setup with the correct parameters', () => {
		process.env.OPENTELEMETRY_TRACING_ENDPOINT = 'MOCK_TRACING_ENDPOINT';
		process.env.OPENTELEMETRY_AUTHORIZATION_HEADER = 'MOCK_AUTH_HEADER';
		process.env.OPENTELEMETRY_METRICS_ENDPOINT = 'MOCK_METRICS_ENDPOINT';
		process.env.OPENTELEMETRY_API_GATEWAY_KEY = 'MOCK_API_GATEWAY_KEY';
		require('../../setup.js');

		expect(opentelemetry.setup).toHaveBeenCalledTimes(1);
		expect(opentelemetry.setup).toHaveBeenCalledWith({
			tracing: {
				authorizationHeader: 'MOCK_AUTH_HEADER',
				endpoint: 'MOCK_TRACING_ENDPOINT'
			},
			metrics: {
				apiGatewayKey: 'MOCK_API_GATEWAY_KEY',
				endpoint: 'MOCK_METRICS_ENDPOINT'
			}
		});
	});

	describe('when no traces endpoint is specified', () => {
		it('should not include tracing configuration', () => {
			delete process.env.OPENTELEMETRY_TRACING_ENDPOINT;
			process.env.OPENTELEMETRY_METRICS_ENDPOINT = 'MOCK_METRICS_ENDPOINT';
			require('../../setup.js');

			expect(opentelemetry.setup).toHaveBeenCalledTimes(1);
			expect(opentelemetry.setup).toHaveBeenCalledWith({
				metrics: {
					apiGatewayKey: 'MOCK_API_GATEWAY_KEY',
					endpoint: 'MOCK_METRICS_ENDPOINT'
				}
			});
		});
	});

	describe('when no metrics endpoint is specified', () => {
		it('should not include metrics configuration', () => {
			delete process.env.OPENTELEMETRY_METRICS_ENDPOINT;
			process.env.OPENTELEMETRY_TRACING_ENDPOINT = 'MOCK_TRACING_ENDPOINT';
			require('../../setup.js');

			expect(opentelemetry.setup).toHaveBeenCalledTimes(1);
			expect(opentelemetry.setup).toHaveBeenCalledWith({
				tracing: {
					authorizationHeader: 'MOCK_AUTH_HEADER',
					endpoint: 'MOCK_TRACING_ENDPOINT'
				}
			});
		});
	});

	describe('when a sample rate is specified', () => {
		it('calls OpenTelemetry with the given sample percentage as a number', () => {
			delete process.env.OPENTELEMETRY_METRICS_ENDPOINT;
			process.env.OPENTELEMETRY_TRACING_SAMPLE_PERCENTAGE = '50';
			require('../../setup.js');

			expect(opentelemetry.setup).toHaveBeenCalledTimes(1);
			expect(opentelemetry.setup).toHaveBeenCalledWith({
				tracing: {
					authorizationHeader: 'MOCK_AUTH_HEADER',
					endpoint: 'MOCK_TRACING_ENDPOINT',
					samplePercentage: 50
				}
			});
		});
	});

	describe('when a non-numeric sample rate is specified', () => {
		it('calls OpenTelemetry with NaN as a percentage', () => {
			delete process.env.OPENTELEMETRY_METRICS_ENDPOINT;
			process.env.OPENTELEMETRY_TRACING_SAMPLE_PERCENTAGE = 'nope';
			require('../../setup.js');

			expect(opentelemetry.setup).toHaveBeenCalledTimes(1);
			expect(opentelemetry.setup).toHaveBeenCalledWith({
				tracing: {
					authorizationHeader: 'MOCK_AUTH_HEADER',
					endpoint: 'MOCK_TRACING_ENDPOINT',
					samplePercentage: NaN
				}
			});
		});
	});
});
