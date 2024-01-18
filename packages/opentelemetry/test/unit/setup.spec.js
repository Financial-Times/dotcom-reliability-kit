describe('setupOpenTelemetry', () => {
	let setupOpenTelemetry;

	beforeEach(() => {
		jest.resetModules();
		jest.mock('../../lib/index.js', () => jest.fn());
		setupOpenTelemetry = require('../../lib/index.js');
	});

	it('should call setupOpenTelemetry with the correct parameters', () => {
		process.env.OPENTELEMETRY_TRACING_ENDPOINT = 'MOCK_TRACING_ENDPOINT';
		process.env.OPENTELEMETRY_AUTHORIZATION_HEADER = 'MOCK_AUTH_HEADER';
		require('../../setup.js');

		expect(setupOpenTelemetry).toHaveBeenCalledTimes(1);
		expect(setupOpenTelemetry).toHaveBeenCalledWith({
			authorizationHeader: 'MOCK_AUTH_HEADER',
			tracing: {
				endpoint: 'MOCK_TRACING_ENDPOINT'
			}
		});
	});

	describe('when a sample rate is specified', () => {
		it('calls OpenTelemetry with the given sample percentage as a number', () => {
			process.env.OPENTELEMETRY_TRACING_SAMPLE_PERCENTAGE = '50';
			require('../../setup.js');

			expect(setupOpenTelemetry).toHaveBeenCalledTimes(1);
			expect(setupOpenTelemetry).toHaveBeenCalledWith({
				authorizationHeader: 'MOCK_AUTH_HEADER',
				tracing: {
					endpoint: 'MOCK_TRACING_ENDPOINT',
					samplePercentage: 50
				}
			});
		});
	});

	describe('when a non-numeric sample rate is specified', () => {
		it('calls OpenTelemetry with NaN as a percentage', () => {
			process.env.OPENTELEMETRY_TRACING_SAMPLE_PERCENTAGE = 'nope';
			require('../../setup.js');

			expect(setupOpenTelemetry).toHaveBeenCalledTimes(1);
			expect(setupOpenTelemetry).toHaveBeenCalledWith({
				authorizationHeader: 'MOCK_AUTH_HEADER',
				tracing: {
					endpoint: 'MOCK_TRACING_ENDPOINT',
					samplePercentage: NaN
				}
			});
		});
	});

	describe('when no traces endpoint is specified', () => {
		it('should not include tracing configuration', () => {
			delete process.env.OPENTELEMETRY_TRACING_ENDPOINT;
			require('../../setup.js');

			expect(setupOpenTelemetry).toHaveBeenCalledTimes(1);
			expect(setupOpenTelemetry).toHaveBeenCalledWith({
				authorizationHeader: 'MOCK_AUTH_HEADER'
			});
		});
	});
});
