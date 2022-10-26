const logger = require('../../..');

jest.mock('../../../lib/logger', () => jest.fn());
const MockLogger = require('../../../lib/logger');

jest.mock('../../../lib/transforms/legacy-mask', () => jest.fn());
const createLegacyMaskTransform = require('../../../lib/transforms/legacy-mask');

describe('@dotcom-reliability-kit/logger', () => {
	it('exports the logger instance', () => {
		expect(logger).toBeInstanceOf(MockLogger);
	});

	describe('.Logger', () => {
		it('aliases lib/logger', () => {
			expect(logger.Logger).toStrictEqual(MockLogger);
		});
	});

	describe('.transforms', () => {
		describe('.legacyMask', () => {
			it('aliases lib/transforms/legacy-mask', () => {
				expect(logger.transforms.legacyMask).toStrictEqual(
					createLegacyMaskTransform
				);
			});
		});
	});

	describe('.default', () => {
		it('aliases the module exports', () => {
			expect(logger.default).toStrictEqual(logger);
		});
	});
});
