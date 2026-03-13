import assert from 'node:assert/strict';
import { beforeEach, describe, it, mock } from 'node:test';

const setupFromEnv = mock.fn();
mock.module('../../lib/setup-from-env.js', { namedExports: { setupFromEnv } });

describe('setup', () => {
	beforeEach(async () => {
		mock.property(process, 'env', { MOCK_ENV: 'true' });
		await import('../../setup.js');
	});

	it('calls setupFromEnv with proces.env', () => {
		assert.strictEqual(setupFromEnv.mock.callCount(), 1);
		assert.deepStrictEqual(setupFromEnv.mock.calls[0].arguments, [{ MOCK_ENV: 'true' }]);
	});
});
