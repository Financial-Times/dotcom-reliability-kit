const { Queue } = require('../../../../lib/queue/Queue');

describe('Queue (base class)', () => {
	it('has a constructor that sets the capacity', () => {
		const queue = new Queue({ capacity: 11 });
		expect(queue.capacity).toBe(11);
	});

	it('has base methods that returns dummy data', () => {
		const queue = new Queue({ capacity: 11 });
		expect(queue.size).toBe(0);
		expect(queue.pull()).toStrictEqual([]);
	});

	it('throws if adding to the base class', () => {
		const queue = new Queue({ capacity: 11 });
		expect(() => queue.add({ data: 'test' })).toThrow('Not implemented');
	});

	it('throws if clear from the base class', () => {
		const queue = new Queue({ capacity: 11 });
		expect(() => queue.clear()).toThrow('Not implemented');
	});

	it('throws if using drop() from the base class', () => {
		const queue = new Queue({ capacity: 11 });
		expect(() => queue.drop()).toThrow('Not implemented');
	});
});
