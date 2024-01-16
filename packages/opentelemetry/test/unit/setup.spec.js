jest.mock('../../lib/index.js', () => jest.fn());

const mockSetupOpenTelemetry = require('../../lib/index.js');

describe('setupOpenTelemetry', () => {
	it('should call setupOpenTelemetry with the correct parameters', () => {
		process.env.OPENTELEMETRY_TRACES_ENDPOINT = 'MOCK_TRACES_ENDPOINT';
		process.env.OPENTELEMETRY_AUTHORIZATION_HEADER = 'MOCK_AUTH_HEADER';
		require('../../setup.js');

		expect(mockSetupOpenTelemetry).toHaveBeenCalledWith({
			authorizationHeader: 'MOCK_AUTH_HEADER',
			tracesEndpoint: 'MOCK_TRACES_ENDPOINT'
		});
		expect(mockSetupOpenTelemetry).toHaveBeenCalledTimes(1);
	});
});
