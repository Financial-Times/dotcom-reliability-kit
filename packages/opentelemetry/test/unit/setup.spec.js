describe('setup', () => {
	let opentelemetry;

	beforeEach(() => {
		jest.resetModules();
		jest.mock('../..', () => ({ setup: jest.fn() }));
		opentelemetry = require('../..');
	});

	it('should call opentelemetry.setup with the correct parameters', () => {
		delete process.env.OPENTELEMETRY_LOG_INTERNALS;
		process.env.OPENTELEMETRY_TRACING_ENDPOINT = 'MOCK_TRACING_ENDPOINT';
		process.env.OPENTELEMETRY_AUTHORIZATION_HEADER = 'MOCK_AUTH_HEADER';
		process.env.OPENTELEMETRY_METRICS_ENDPOINT = 'MOCK_METRICS_ENDPOINT';
		process.env.OPENTELEMETRY_API_GATEWAY_KEY = 'MOCK_API_GATEWAY_KEY';
		require('../../setup.js');

		expect(opentelemetry.setup).toHaveBeenCalledTimes(1);
		expect(opentelemetry.setup).toHaveBeenCalledWith({
			logInternals: false,
			tracing: {
				authorizationHeader: 'MOCK_AUTH_HEADER',
				endpoint: 'MOCK_TRACING_ENDPOINT'
			},
			metrics: {
				apiGatewayKey: 'MOCK_API_GATEWAY_KEY',
				endpoint: 'MOCK_METRICS_ENDPOINT'
			},
			views: {}
		});
	});

	describe('when no traces endpoint is specified', () => {
		it('should not include tracing configuration', () => {
			delete process.env.OPENTELEMETRY_TRACING_ENDPOINT;
			process.env.OPENTELEMETRY_METRICS_ENDPOINT = 'MOCK_METRICS_ENDPOINT';
			require('../../setup.js');

			expect(opentelemetry.setup).toHaveBeenCalledTimes(1);
			expect(opentelemetry.setup).toHaveBeenCalledWith({
				logInternals: false,
				metrics: {
					apiGatewayKey: 'MOCK_API_GATEWAY_KEY',
					endpoint: 'MOCK_METRICS_ENDPOINT'
				},
				views: {}
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
				logInternals: false,
				tracing: {
					authorizationHeader: 'MOCK_AUTH_HEADER',
					endpoint: 'MOCK_TRACING_ENDPOINT'
				},
				views: {}
			});
		});
	});

	describe('when an HTTP server duration bucket is specified', () => {
		it('includes views configurations', () => {
			process.env.OPENTELEMETRY_VIEWS_HTTP_SERVER_DURATION_BUCKETS = '1,2,3,  4  ,five';
			require('../../setup.js');

			expect(opentelemetry.setup).toHaveBeenCalledTimes(1);
			expect(opentelemetry.setup).toHaveBeenCalledWith(
				expect.objectContaining({
					views: {
						httpServerDurationBuckets: [1, 2, 3, 4, NaN]
					}
				})
			);
			delete process.env.OPENTELEMETRY_VIEWS_HTTP_SERVER_DURATION_BUCKETS;
		});
	});

	describe('when an HTTP client duration bucket is specified', () => {
		it('includes views configurations', () => {
			process.env.OPENTELEMETRY_VIEWS_HTTP_CLIENT_DURATION_BUCKETS = '1,2,3,  4  ,five';
			require('../../setup.js');

			expect(opentelemetry.setup).toHaveBeenCalledTimes(1);
			expect(opentelemetry.setup).toHaveBeenCalledWith(
				expect.objectContaining({
					views: {
						httpClientDurationBuckets: [1, 2, 3, 4, NaN]
					}
				})
			);
			delete process.env.OPENTELEMETRY_VIEWS_HTTP_CLIENT_DURATION_BUCKETS;
		});
	});

	describe('when a sample rate is specified', () => {
		it('calls OpenTelemetry with the given sample percentage as a number', () => {
			delete process.env.OPENTELEMETRY_METRICS_ENDPOINT;
			process.env.OPENTELEMETRY_TRACING_SAMPLE_PERCENTAGE = '50';
			require('../../setup.js');

			expect(opentelemetry.setup).toHaveBeenCalledTimes(1);
			expect(opentelemetry.setup).toHaveBeenCalledWith({
				logInternals: false,
				tracing: {
					authorizationHeader: 'MOCK_AUTH_HEADER',
					endpoint: 'MOCK_TRACING_ENDPOINT',
					samplePercentage: 50
				},
				views: {}
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
				logInternals: false,
				tracing: {
					authorizationHeader: 'MOCK_AUTH_HEADER',
					endpoint: 'MOCK_TRACING_ENDPOINT',
					samplePercentage: NaN
				},
				views: {}
			});
		});
	});

	describe('when internal logs are enabled', () => {
		it('calls OpenTelemetry with the logInternal option set to true', () => {
			process.env.OPENTELEMETRY_LOG_INTERNALS = 'true';
			require('../../setup.js');

			expect(opentelemetry.setup).toHaveBeenCalledTimes(1);
			expect(opentelemetry.setup).toHaveBeenCalledWith(
				expect.objectContaining({
					logInternals: true
				})
			);
		});
	});
});
