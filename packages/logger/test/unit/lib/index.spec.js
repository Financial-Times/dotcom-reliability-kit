const { describe, it, mock } = require('node:test');
const assert = require('node:assert/strict');

mock.module('../../../lib/logger.js', { defaultExport: mock.fn() });
const MockLogger = require('../../../lib/logger');

mock.module('../../../lib/transforms/legacy-mask.js', { defaultExport: mock.fn() });
const createLegacyMaskTransform = require('../../../lib/transforms/legacy-mask');

const logger = require('@dotcom-reliability-kit/logger');

describe('@dotcom-reliability-kit/logger', () => {
	it('exports the logger instance', () => {
		assert.ok(logger instanceof MockLogger);
	});

	describe('.Logger', () => {
		it('aliases lib/logger', () => {
			assert.strictEqual(logger.Logger, MockLogger);
		});
	});

	describe('.transforms', () => {
		describe('.legacyMask', () => {
			it('aliases lib/transforms/legacy-mask', () => {
				assert.strictEqual(logger.transforms.legacyMask, createLegacyMaskTransform);
			});
		});
	});

	describe('.default', () => {
		it('aliases the module exports', () => {
			assert.strictEqual(logger.default, logger);
		});
	});
});
