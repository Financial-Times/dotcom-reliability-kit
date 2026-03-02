import assert from 'node:assert/strict';
import { describe, it, mock } from 'node:test';

const MockLogger = mock.fn(class Logger {});
mock.module('../../../lib/logger.js', { defaultExport: MockLogger });

const createLegacyMaskTransform = mock.fn();
mock.module('../../../lib/transforms/legacy-mask.js', { defaultExport: createLegacyMaskTransform });

const { default: logger, Logger, transforms } = await import('@dotcom-reliability-kit/logger');

describe('@dotcom-reliability-kit/logger', () => {
	it('exports the logger instance', () => {
		assert.ok(logger instanceof MockLogger);
	});

	describe('.Logger', () => {
		it('aliases lib/logger', () => {
			assert.strictEqual(Logger, MockLogger);
		});
	});

	describe('.transforms', () => {
		describe('.legacyMask', () => {
			it('aliases lib/transforms/legacy-mask', () => {
				assert.strictEqual(transforms.legacyMask, createLegacyMaskTransform);
			});
		});
	});
});
