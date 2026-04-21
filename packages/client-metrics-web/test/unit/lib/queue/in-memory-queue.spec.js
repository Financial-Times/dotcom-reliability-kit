import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { InMemoryQueue } from '../../../../lib/queue/in-memory-queue.js';

describe('InMemoryQueue (extends Queue)', () => {
	const testMetric = {
		namespace: 'test',
		timestampe: 100000000,
		data: {
			test: 2
		}
	};

	it('instantiates a new queue as an empty array and can override the capacity', () => {
		const queue = new InMemoryQueue({ capacity: 11 });
		assert.strictEqual(queue.capacity, 11);
		assert.strictEqual(queue.size, 0);
	});

	it('adds items to the queue', () => {
		const queue = new InMemoryQueue({ capacity: 11 });
		queue.add(testMetric);
		assert.strictEqual(queue.size, 1);
		assert.deepStrictEqual(queue.pull(1), [testMetric]);
	});

	it('drops the oldest item when trying to add an item to a full queue', () => {
		const queue = new InMemoryQueue({ capacity: 1 });
		queue.add({
			data: 'old.event'
		});
		queue.add({
			data: 'new.event'
		});
		assert.strictEqual(queue.size, 1);
		assert.deepStrictEqual(queue.pull(1), [{ data: 'new.event' }]);
	});

	it('returns at least one item when pulling from the queue without specifying the count', () => {
		const queue = new InMemoryQueue({ capacity: 1 });
		queue.add(testMetric);
		assert.strictEqual(queue.pull().length, 1);
	});
});
