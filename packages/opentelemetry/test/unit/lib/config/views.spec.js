jest.mock('@dotcom-reliability-kit/logger');
jest.mock('@opentelemetry/sdk-node');

const logger = require('@dotcom-reliability-kit/logger');
const { AggregationType, InstrumentType } =
	require('@opentelemetry/sdk-node').metrics;

AggregationType.EXPLICIT_BUCKET_HISTOGRAM = 'mock-explicit-bucket';
InstrumentType.HISTOGRAM = 'mock-histogram';

const { createViewConfig } = require('../../../../lib/config/views');

describe('@dotcom-reliability-kit/opentelemetry/lib/config/views', () => {
	it('exports a function', () => {
		expect(typeof createViewConfig).toBe('function');
	});

	describe('createViewConfig(options)', () => {
		let config;

		beforeAll(() => {
			config = createViewConfig({
				httpClientDurationBuckets: [1, 2, 3, 4],
				httpServerDurationBuckets: [5, 6, 7, 8]
			});
		});

		it('returns the configuration', () => {
			expect(config).toEqual({
				views: [
					{
						instrumentName: 'http.client.duration',
						instrumentType: 'mock-histogram',
						aggregation: {
							type: 'mock-explicit-bucket',
							options: { boundaries: [1, 2, 3, 4] }
						}
					},
					{
						instrumentName: 'http.server.duration',
						instrumentType: 'mock-histogram',
						aggregation: {
							type: 'mock-explicit-bucket',
							options: { boundaries: [5, 6, 7, 8] }
						}
					}
				]
			});
		});

		describe('when options.httpClientDurationBuckets is not defined', () => {
			beforeAll(() => {
				config = createViewConfig({
					httpServerDurationBuckets: [5, 6, 7, 8]
				});
			});

			it('returns the configuration without an HTTP client duration view', () => {
				expect(config).toEqual({
					views: [
						{
							instrumentName: 'http.server.duration',
							instrumentType: 'mock-histogram',
							aggregation: {
								type: 'mock-explicit-bucket',
								options: { boundaries: [5, 6, 7, 8] }
							}
						}
					]
				});
			});
		});

		describe('when options.httpClientDurationBuckets contains negative numbers', () => {
			beforeAll(() => {
				config = createViewConfig({
					httpClientDurationBuckets: [1, -2, 3, 4]
				});
			});

			it('returns the configuration without an HTTP server duration view', () => {
				expect(config).toEqual({});
			});

			it('logs a warning', () => {
				expect(logger.warn).toHaveBeenCalledWith({
					event: 'OTEL_VIEW_CONFIG_ISSUE',
					message:
						'HTTP client duration buckets must only contain numbers greater than zero'
				});
			});
		});

		describe('when options.httpClientDurationBuckets contains zero', () => {
			beforeAll(() => {
				config = createViewConfig({
					httpClientDurationBuckets: [0, 1, 2, 3, 4]
				});
			});

			it('returns the configuration without an HTTP server duration view', () => {
				expect(config).toEqual({});
			});

			it('logs a warning', () => {
				expect(logger.warn).toHaveBeenCalledWith({
					event: 'OTEL_VIEW_CONFIG_ISSUE',
					message:
						'HTTP client duration buckets must only contain numbers greater than zero'
				});
			});
		});

		describe('when options.httpClientDurationBuckets contains non-numbers', () => {
			beforeAll(() => {
				config = createViewConfig({
					httpClientDurationBuckets: [1, '2', 3, 4]
				});
			});

			it('returns the configuration without an HTTP server duration view', () => {
				expect(config).toEqual({});
			});

			it('logs a warning', () => {
				expect(logger.warn).toHaveBeenCalledWith({
					event: 'OTEL_VIEW_CONFIG_ISSUE',
					message:
						'HTTP client duration buckets must only contain numbers greater than zero'
				});
			});
		});

		describe('when options.httpServerDurationBuckets is not defined', () => {
			beforeAll(() => {
				config = createViewConfig({
					httpClientDurationBuckets: [1, 2, 3, 4]
				});
			});

			it('returns the configuration without an HTTP server duration view', () => {
				expect(config).toEqual({
					views: [
						{
							instrumentName: 'http.client.duration',
							instrumentType: 'mock-histogram',
							aggregation: {
								type: 'mock-explicit-bucket',
								options: { boundaries: [1, 2, 3, 4] }
							}
						}
					]
				});
			});
		});

		describe('when options.httpServerDurationBuckets contains negative numbers', () => {
			beforeAll(() => {
				config = createViewConfig({
					httpServerDurationBuckets: [1, -2, 3, 4]
				});
			});

			it('returns the configuration without an HTTP server duration view', () => {
				expect(config).toEqual({});
			});

			it('logs a warning', () => {
				expect(logger.warn).toHaveBeenCalledWith({
					event: 'OTEL_VIEW_CONFIG_ISSUE',
					message:
						'HTTP server duration buckets must only contain numbers greater than zero'
				});
			});
		});

		describe('when options.httpServerDurationBuckets contains zero', () => {
			beforeAll(() => {
				config = createViewConfig({
					httpServerDurationBuckets: [0, 1, 2, 3, 4]
				});
			});

			it('returns the configuration without an HTTP server duration view', () => {
				expect(config).toEqual({});
			});

			it('logs a warning', () => {
				expect(logger.warn).toHaveBeenCalledWith({
					event: 'OTEL_VIEW_CONFIG_ISSUE',
					message:
						'HTTP server duration buckets must only contain numbers greater than zero'
				});
			});
		});

		describe('when options.httpServerDurationBuckets contains non-numbers', () => {
			beforeAll(() => {
				config = createViewConfig({
					httpServerDurationBuckets: [1, '2', 3, 4]
				});
			});

			it('returns the configuration without an HTTP server duration view', () => {
				expect(config).toEqual({});
			});

			it('logs a warning', () => {
				expect(logger.warn).toHaveBeenCalledWith({
					event: 'OTEL_VIEW_CONFIG_ISSUE',
					message:
						'HTTP server duration buckets must only contain numbers greater than zero'
				});
			});
		});

		describe('when no options are defined', () => {
			beforeAll(() => {
				config = createViewConfig({});
			});

			it('returns the configuration without any views', () => {
				expect(config).toEqual({});
			});
		});
	});
});
