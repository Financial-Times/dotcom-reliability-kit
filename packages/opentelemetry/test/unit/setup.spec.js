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
