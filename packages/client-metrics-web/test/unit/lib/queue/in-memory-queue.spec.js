const { InMemoryQueue } = require('../../../../lib/queue/in-memory-queue');

describe('InMemoryQueue (extends Queue)', () => {
	const testMetric = {
		namespace: 'test',
		timestampe: 100000000,
		data: {
			test: 2
		}
	};

	it('instantiates a new queue as an empty array and can override the capacity', async () => {
		const queue = new InMemoryQueue({ capacity: 11 });
		expect(queue.capacity).toBe(11);

		expect(await queue.size()).toBe(0);
	});

	it('adds items to the queue', async () => {
		const queue = new InMemoryQueue({ capacity: 11 });
		await queue.add(testMetric);
		expect(await queue.size()).toBe(1);
		expect(...(await queue.pull(1))).toStrictEqual(testMetric);
	});

	it('drops the oldest item when trying to add an item to a full queue', async () => {
		const queue = new InMemoryQueue({ capacity: 1 });
		await queue.add({
			data: 'old.event'
		});
		await queue.add({
			data: 'new.event'
		});
		expect(await queue.size()).toBe(1);
		expect(...(await queue.pull(1))).toStrictEqual({
			data: 'new.event'
		});
	});

	it('returns at least one item when pulling from the queue without specifying the count', async () => {
		const queue = new InMemoryQueue({ capacity: 1 });
		await queue.add(testMetric);
		expect((await queue.pull()).length).toBe(1);
	});

	it('requeue items at the front of the queue', async () => {
		const queue = new InMemoryQueue({ capacity: 11 });
		await queue.add({
			data: 'first.event'
		});
		await queue.add({
			data: 'second.event'
		});
		await queue.requeue([
			{
				data: 'requeue.event'
			}
		]);
		const eventInOrder = await queue.pull(3);

		expect(eventInOrder).toStrictEqual([
			{ data: 'requeue.event' },
			{ data: 'first.event' },
			{ data: 'second.event' }
		]);
	});
});
