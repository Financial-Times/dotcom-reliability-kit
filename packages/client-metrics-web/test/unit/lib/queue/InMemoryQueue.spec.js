const { InMemoryQueue } = require('../../../../lib/queue/InMemoryQueue');

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
		expect(queue.capacity).toBe(11);
		expect(queue.size).toBe(0);
	});

	it('adds items to the queue', () => {
		const queue = new InMemoryQueue({ capacity: 11 });
		queue.add(testMetric);
		expect(queue.size).toBe(1);
		expect(...queue.pull(1)).toStrictEqual(testMetric);
	});

	it('drops the oldest item when trying to add an item to a full queue', () => {
		const queue = new InMemoryQueue({ capacity: 1 });
		queue.add({
			data: 'old.event'
		});
		queue.add({
			data: 'new.event'
		});
		expect(queue.size).toBe(1);
		expect(...queue.pull(1)).toStrictEqual({
			data: 'new.event'
		});
	});

	it('clears the queue with the clear method', () => {
		const queue = new InMemoryQueue({ capacity: 1 });
		queue.add(testMetric);
		expect(queue.size).toBe(1);
		queue.clear();
		expect(queue.size).toBe(0);
	});

	it('throw an error if trying to pull more items that there are in the queue', () => {
		const queue = new InMemoryQueue({ capacity: 11 });
		queue.add(testMetric);
		expect(queue.size).toBe(1);

		expect(() => queue.pull(2)).toThrow("Queue.size is 1 so it can't pull 2 items.");
	});

	it('throws an error if trying to get more items that there are in the queue', () => {
		const queue = new InMemoryQueue({ capacity: 11 });
		queue.add(testMetric);
		expect(queue.size).toBe(1);

		expect(() => queue.getItems(2)).toThrow("Queue.size is 1 so it can't get 2 items.");
	});
});
