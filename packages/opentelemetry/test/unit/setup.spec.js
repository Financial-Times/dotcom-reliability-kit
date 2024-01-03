jest.mock('../../lib/index.js', () => jest.fn());

const mockSetupOpenTelemetry = require('../../lib/index.js');

describe('setupOpenTelemetry', () => {
	it('should call setupOpenTelemetry with the correct parameters', () => {
		process.env.OPENTELEMETRY_TRACES_ENDPOINT = 'MOCK_TRACES_ENDPOINT';
		require('../../setup.js');

		expect(mockSetupOpenTelemetry).toHaveBeenCalledWith({
			tracesEndpoint: 'MOCK_TRACES_ENDPOINT'
		});
		expect(mockSetupOpenTelemetry).toHaveBeenCalledTimes(1);
	});
});
