jest.mock('@opentelemetry/auto-instrumentations-node', () => ({
	getNodeAutoInstrumentations: jest
		.fn()
		.mockReturnValue('mock-auto-instrumentations')
}));
jest.mock('@opentelemetry/instrumentation-runtime-node');
jest.mock('@dotcom-reliability-kit/log-error');
jest.mock('@dotcom-reliability-kit/errors');

const {
	getNodeAutoInstrumentations
} = require('@opentelemetry/auto-instrumentations-node');
const {
	RuntimeNodeInstrumentation
} = require('@opentelemetry/instrumentation-runtime-node');
const { logRecoverableError } = require('@dotcom-reliability-kit/log-error');
const { UserInputError } = require('@dotcom-reliability-kit/errors');

const {
	createInstrumentationConfig
} = require('../../../../lib/config/instrumentations');

describe('@dotcom-reliability-kit/opentelemetry/lib/config/instrumentation', () => {
	it('exports a function', () => {
		expect(typeof createInstrumentationConfig).toBe('function');
	});

	describe('createInstrumentationConfig()', () => {
		let instrumentations;

		beforeEach(() => {
			RuntimeNodeInstrumentation.mockReset();
			instrumentations = createInstrumentationConfig();
		});

		it('creates Node.js auto-instrumentations with some configurations', () => {
			expect(getNodeAutoInstrumentations).toHaveBeenCalledTimes(1);
			expect(getNodeAutoInstrumentations).toHaveBeenCalledWith({
				'@opentelemetry/instrumentation-http': {
					ignoreIncomingRequestHook: expect.any(Function)
				},
				'@opentelemetry/instrumentation-fs': {
					enabled: false
				},
				'@opentelemetry/instrumentation-pino': {
					enabled: false
				}
			});
		});

		it('sets up runtime Node.js instrumentations', () => {
			expect(RuntimeNodeInstrumentation).toHaveBeenCalledTimes(1);
			expect(RuntimeNodeInstrumentation).toHaveBeenCalledWith();
		});

		describe('ignore incoming request hook function', () => {
			let ignoreIncomingRequestHook;

			beforeAll(() => {
				ignoreIncomingRequestHook =
					getNodeAutoInstrumentations.mock.calls[0][0][
						'@opentelemetry/instrumentation-http'
					].ignoreIncomingRequestHook;
			});

			it('returns `true` with a request to `/__gtg`', () => {
				const mockRequest = {
					url: '/__gtg?a=b',
					headers: { host: 'mock-host' }
				};
				expect(ignoreIncomingRequestHook(mockRequest)).toBe(true);
			});

			it('returns `true` with a request to `/__health`', () => {
				const mockRequest = {
					url: '/__health?a=b',
					headers: { host: 'mock-host' }
				};
				expect(ignoreIncomingRequestHook(mockRequest)).toBe(true);
			});

			it('returns `true` with a request to `/favicon.ico`', () => {
				const mockRequest = {
					url: '/favicon.ico?a=b',
					headers: { host: 'mock-host' }
				};
				expect(ignoreIncomingRequestHook(mockRequest)).toBe(true);
			});

			it('returns `false` with a request to anything else', () => {
				const mockRequest = {
					url: '/mock-endpoint',
					headers: { host: 'mock-host' }
				};
				expect(ignoreIncomingRequestHook(mockRequest)).toBe(false);
			});

			it('returns `false` when a request URL is not present', () => {
				const mockRequest = {
					url: undefined,
					headers: { host: 'mock-host' }
				};
				expect(ignoreIncomingRequestHook(mockRequest)).toBe(false);
			});

			it("doesn't throw when the host header isn't set", () => {
				const mockRequest = {
					url: '/mock-endpoint',
					headers: {}
				};
				expect(() => ignoreIncomingRequestHook(mockRequest)).not.toThrow();
			});

			it('logs a warning and returns `false` when a request URL cannot be parsed', () => {
				const mockRequest = {
					url: '/mock-endpont',
					headers: { host: '' }
				};
				expect(ignoreIncomingRequestHook(mockRequest)).toBe(false);
				expect(UserInputError).toHaveBeenCalledTimes(1);
				expect(UserInputError).toHaveBeenCalledWith(
					expect.objectContaining({
						code: 'OTEL_REQUEST_FILTER_FAILURE'
					})
				);
				expect(logRecoverableError).toHaveBeenCalledTimes(1);
				expect(logRecoverableError).toHaveBeenCalledWith(
					expect.objectContaining({
						error: expect.any(UserInputError),
						includeHeaders: ['host'],
						request: mockRequest
					})
				);
			});
		});

		it('returns an array of instrumentations', () => {
			expect(instrumentations).toEqual([
				'mock-auto-instrumentations',
				expect.any(RuntimeNodeInstrumentation)
			]);
		});
	});
});
