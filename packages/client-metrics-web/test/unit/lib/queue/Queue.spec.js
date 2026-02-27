const { Queue } = require('../../../../lib/queue/Queue');

describe('Queue (base class)', () => {
	it('has a constructor that sets the capacity', () => {
		const queue = new Queue({ capacity: 11 });
		expect(queue.capacity).toBe(11);
	});

	describe('Abstract methods will throw if called', () => {
		it('add (item)', () => {
			const queue = new Queue({ capacity: 11 });
			expect(() => queue.add({ data: 'test' })).toThrow('Must be implemented by subclass');
		});

		it('clear', () => {
			const queue = new Queue({ capacity: 11 });
			expect(() => queue.clear()).toThrow('Must be implemented by subclass');
		});

		it('drop', () => {
			const queue = new Queue({ capacity: 11 });
			expect(() => queue.drop()).toThrow('Must be implemented by subclass');
		});

		it('getItems', () => {
			const queue = new Queue({ capacity: 11 });
			expect(() => queue.getItems()).toThrow('Must be implemented by subclass');
		});
		it('pull', () => {
			const queue = new Queue({ capacity: 11 });
			expect(() => queue.pull()).toThrow('Must be implemented by subclass');
		});

		it('size getter', () => {
			const queue = new Queue({ capacity: 11 });
			expect(() => queue.size()).toThrow('Must be implemented by subclass');
		});
	});
});
