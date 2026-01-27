const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { Queue } = require('../../../../lib/queue/queue');

describe('Queue (base class)', () => {
	it('has a constructor that sets the capacity', () => {
		const queue = new Queue({ capacity: 11 });
		assert.strictEqual(queue.capacity, 11);
	});

	it('uses the default capacity if no capacity is set', () => {
		const queue = new Queue();
		assert.strictEqual(queue.capacity, 10000);
	});

	describe('Abstract methods will throw if called', () => {
		it('add (item)', () => {
			const queue = new Queue({ capacity: 11 });
			assert.throws(
				() => queue.add({ data: 'test' }),
				new Error('Must be implemented by subclass')
			);
		});

		it('drop', () => {
			const queue = new Queue({ capacity: 11 });
			assert.throws(() => queue.drop(), new Error('Must be implemented by subclass'));
		});

		it('pull', () => {
			const queue = new Queue({ capacity: 11 });
			assert.throws(() => queue.pull(), new Error('Must be implemented by subclass'));
		});

		it('size getter', () => {
			const queue = new Queue({ capacity: 11 });
			assert.throws(() => queue.size, new Error('Must be implemented by subclass'));
		});
	});
});
