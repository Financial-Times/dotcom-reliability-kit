jest.mock('@financial-times/n-logger', () => ({
	default: {
		error: jest.fn(),
		log: jest.fn(),
		warn: jest.fn()
	}
}));

process.env.SYSTEM_CODE = 'reliability-kit-express-example';
process.env.REGION = 'test';

const app = require('../app');
const fetch = require('node-fetch');
const logger = require('@financial-times/n-logger').default;

describe('@dotcom-reliability-kit/example-express', () => {
	let server;
	let baseUrl;

	beforeAll(async () => {
		server = await app.listen();
		baseUrl = `http://localhost:${server.address().port}`;
	});

	afterAll(() => {
		server.close();
	});

	describe('GET /http/500', () => {
		let body;
		let response;

		beforeAll(async () => {
			response = await fetch(`${baseUrl}/http/500`);
			body = await response.json();
		});

		it('responds with a 500 status code', () => {
			expect(response.status).toStrictEqual(500);
		});

		it('responds with error details as JSON', () => {
			expect(body).toMatchObject({
				code: 'HTTP_500',
				data: {},
				isOperational: true,
				message: 'Internal Server Error',
				name: 'HttpError',
				relatesToSystems: [],
				statusCode: 500
			});
		});

		it('logs error information', () => {
			expect(logger.log).toBeCalledTimes(1);
			expect(logger.log.mock.calls[0][0]).toStrictEqual('error');
			expect(logger.log.mock.calls[0][1]).toMatchObject({
				event: 'HANDLED_ERROR',
				error: {
					code: 'HTTP_500',
					data: {},
					isOperational: true,
					message: 'Internal Server Error',
					name: 'HttpError',
					relatesToSystems: [],
					statusCode: 500
				},
				app: {
					name: 'reliability-kit-express-example',
					region: 'test'
				},
				request: {
					id: null,
					method: 'GET',
					url: '/http/500',
					headers: {
						accept: '*/*'
					},
					route: {
						path: '/http/:statusCode',
						params: {}
					}
				}
			});
			logger.log.mockReset();
		});
	});

	describe('GET /http/400', () => {
		let body;
		let response;

		beforeAll(async () => {
			response = await fetch(`${baseUrl}/http/400`);
			body = await response.json();
		});

		it('responds with a 400 status code', () => {
			expect(response.status).toStrictEqual(400);
		});

		it('responds with error details as JSON', () => {
			expect(body).toMatchObject({
				code: 'HTTP_400',
				data: {},
				isOperational: true,
				message: 'Bad Request',
				name: 'HttpError',
				relatesToSystems: [],
				statusCode: 400
			});
		});

		it('logs error information', () => {
			expect(logger.log).toBeCalledTimes(1);
			expect(logger.log.mock.calls[0][0]).toStrictEqual('error');
			expect(logger.log.mock.calls[0][1]).toMatchObject({
				event: 'HANDLED_ERROR',
				error: {
					code: 'HTTP_400',
					data: {},
					isOperational: true,
					message: 'Bad Request',
					name: 'HttpError',
					relatesToSystems: [],
					statusCode: 400
				},
				app: {
					name: 'reliability-kit-express-example',
					region: 'test'
				},
				request: {
					id: null,
					method: 'GET',
					url: '/http/400',
					headers: {
						accept: '*/*'
					},
					route: {
						path: '/http/:statusCode',
						params: {}
					}
				}
			});
			logger.log.mockReset();
		});
	});

	describe('GET /recoverable', () => {
		let response;

		beforeAll(async () => {
			response = await fetch(`${baseUrl}/recoverable`);
		});

		it('responds with a 200 status code', () => {
			expect(response.status).toStrictEqual(200);
		});

		it('logs error information', () => {
			expect(logger.log).toBeCalledTimes(1);
			expect(logger.log.mock.calls[0][0]).toStrictEqual('warn');
			expect(logger.log.mock.calls[0][1]).toMatchObject({
				event: 'RECOVERABLE_ERROR',
				error: {
					code: 'SOMETHING_WENT_WRONG',
					data: {},
					isOperational: true,
					message: 'Something went wrong',
					name: 'OperationalError',
					relatesToSystems: ['example-system'],
					statusCode: null
				},
				app: {
					name: 'reliability-kit-express-example',
					region: 'test'
				},
				request: {
					id: null,
					method: 'GET',
					url: '/recoverable',
					headers: {
						accept: '*/*'
					},
					route: {
						path: '/recoverable',
						params: {}
					}
				}
			});
			logger.log.mockReset();
		});
	});
});
