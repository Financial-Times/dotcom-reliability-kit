const logger = require('../../..');

jest.mock('../../../lib/logger', () => jest.fn());
const MockLogger = require('../../../lib/logger');

describe('@dotcom-reliability-kit/logger', () => {
	it('exports the logger instance', () => {
		expect(logger).toBeInstanceOf(MockLogger);
	});

	describe('.Logger', () => {
		it('aliases lib/logger', () => {
			expect(logger.Logger).toStrictEqual(MockLogger);
		});
	});

	describe('.default', () => {
		it('aliases the module exports', () => {
			expect(logger.default).toStrictEqual(logger);
		});
	});
});
