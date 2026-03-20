import assert from 'node:assert/strict';
import { beforeEach, describe, it, mock } from 'node:test';

const opentelemetry = { setup: mock.fn() };
mock.module('../../../lib/index.js', { namedExports: opentelemetry });

const { setupFromEnv } = await import('../../../lib/setup-from-env.js');

describe('@dotcom-reliability-kit/opentelemetry/lib/setup-from-env', () => {
	beforeEach(() => {
		opentelemetry.setup.mock.resetCalls();
	});

	describe('.setupFromEnv(env)', () => {
		it('calls opentelemetry.setup with the correct parameters', () => {
			setupFromEnv({
				OPENTELEMETRY_TRACING_ENDPOINT: 'MOCK_TRACING_ENDPOINT',
				OPENTELEMETRY_AUTHORIZATION_HEADER: 'MOCK_AUTH_HEADER',
				OPENTELEMETRY_METRICS_ENDPOINT: 'MOCK_METRICS_ENDPOINT',
				OPENTELEMETRY_API_GATEWAY_KEY: 'MOCK_API_GATEWAY_KEY'
			});

			assert.strictEqual(opentelemetry.setup.mock.callCount(), 1);
			assert.partialDeepStrictEqual(opentelemetry.setup.mock.calls[0].arguments, [
				{
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
				}
			]);
		});

		describe('when no traces endpoint is specified', () => {
			it('should not include tracing configuration', () => {
				setupFromEnv({
					OPENTELEMETRY_METRICS_ENDPOINT: 'MOCK_METRICS_ENDPOINT',
					OPENTELEMETRY_API_GATEWAY_KEY: 'MOCK_API_GATEWAY_KEY'
				});

				assert.strictEqual(opentelemetry.setup.mock.callCount(), 1);
				assert.partialDeepStrictEqual(opentelemetry.setup.mock.calls[0].arguments, [
					{
						logInternals: false,
						metrics: {
							apiGatewayKey: 'MOCK_API_GATEWAY_KEY',
							endpoint: 'MOCK_METRICS_ENDPOINT'
						},
						views: {}
					}
				]);
			});
		});

		describe('when no metrics endpoint is specified', () => {
			it('should not include metrics configuration', () => {
				setupFromEnv({
					OPENTELEMETRY_TRACING_ENDPOINT: 'MOCK_TRACING_ENDPOINT',
					OPENTELEMETRY_AUTHORIZATION_HEADER: 'MOCK_AUTH_HEADER'
				});

				assert.strictEqual(opentelemetry.setup.mock.callCount(), 1);
				assert.partialDeepStrictEqual(opentelemetry.setup.mock.calls[0].arguments, [
					{
						logInternals: false,
						tracing: {
							authorizationHeader: 'MOCK_AUTH_HEADER',
							endpoint: 'MOCK_TRACING_ENDPOINT'
						},
						views: {}
					}
				]);
			});
		});

		describe('when an HTTP server duration bucket is specified', () => {
			it('includes views configurations', () => {
				setupFromEnv({
					OPENTELEMETRY_VIEWS_HTTP_SERVER_DURATION_BUCKETS: '1,2,3,  4  ,five'
				});

				assert.strictEqual(opentelemetry.setup.mock.callCount(), 1);
				assert.partialDeepStrictEqual(opentelemetry.setup.mock.calls[0].arguments, [
					{
						views: {
							httpServerDurationBuckets: [1, 2, 3, 4, NaN]
						}
					}
				]);
			});
		});

		describe('when an HTTP client duration bucket is specified', () => {
			it('includes views configurations', () => {
				setupFromEnv({
					OPENTELEMETRY_VIEWS_HTTP_CLIENT_DURATION_BUCKETS: '1,2,3,  4  ,five'
				});

				assert.strictEqual(opentelemetry.setup.mock.callCount(), 1);
				assert.partialDeepStrictEqual(opentelemetry.setup.mock.calls[0].arguments, [
					{
						views: {
							httpClientDurationBuckets: [1, 2, 3, 4, NaN]
						}
					}
				]);
			});
		});

		describe('when a sample rate is specified', () => {
			it('calls OpenTelemetry with the given sample percentage as a number', () => {
				setupFromEnv({
					OPENTELEMETRY_TRACING_ENDPOINT: 'MOCK_TRACING_ENDPOINT',
					OPENTELEMETRY_TRACING_SAMPLE_PERCENTAGE: '50',
					OPENTELEMETRY_AUTHORIZATION_HEADER: 'MOCK_AUTH_HEADER'
				});

				assert.strictEqual(opentelemetry.setup.mock.callCount(), 1);
				assert.partialDeepStrictEqual(opentelemetry.setup.mock.calls[0].arguments, [
					{
						logInternals: false,
						tracing: {
							authorizationHeader: 'MOCK_AUTH_HEADER',
							endpoint: 'MOCK_TRACING_ENDPOINT',
							samplePercentage: 50
						},
						views: {}
					}
				]);
			});
		});

		describe('when a non-numeric sample rate is specified', () => {
			it('calls OpenTelemetry with NaN as a percentage', () => {
				setupFromEnv({
					OPENTELEMETRY_TRACING_ENDPOINT: 'MOCK_TRACING_ENDPOINT',
					OPENTELEMETRY_TRACING_SAMPLE_PERCENTAGE: 'nope',
					OPENTELEMETRY_AUTHORIZATION_HEADER: 'MOCK_AUTH_HEADER'
				});

				assert.strictEqual(opentelemetry.setup.mock.callCount(), 1);
				assert.partialDeepStrictEqual(opentelemetry.setup.mock.calls[0].arguments, [
					{
						logInternals: false,
						tracing: {
							authorizationHeader: 'MOCK_AUTH_HEADER',
							endpoint: 'MOCK_TRACING_ENDPOINT',
							samplePercentage: NaN
						},
						views: {}
					}
				]);
			});
		});

		describe('when internal logs are enabled', () => {
			it('calls OpenTelemetry with the logInternal option set to true', () => {
				setupFromEnv({
					OPENTELEMETRY_LOG_INTERNALS: 'true'
				});

				assert.strictEqual(opentelemetry.setup.mock.callCount(), 1);
				assert.partialDeepStrictEqual(opentelemetry.setup.mock.calls[0].arguments, [
					{
						logInternals: true
					}
				]);
			});
		});
	});
});
