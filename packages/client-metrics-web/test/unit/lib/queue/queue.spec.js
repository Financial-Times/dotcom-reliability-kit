const { Queue } = require('../../../../lib/queue/queue');

describe('Queue (base class)', () => {
	it('has a constructor that sets the capacity', () => {
		const queue = new Queue({ capacity: 11 });
		expect(queue.capacity).toBe(11);
	});

	it('uses the default capacity if no capacity is set', () => {
		const queue = new Queue();
		expect(queue.capacity).toBe(10000);
	});

	describe('Abstract methods will throw if called', () => {
		it('add (item)', async () => {
			const queue = new Queue({ capacity: 11 });
			expect.assertions(1);
			try{
				await queue.add({ data: 'test' });
			} catch(error) {
				expect(error.message).toBe('Must be implemented by subclass');
			}
		});

		it('drop', async () => {
			const queue = new Queue({ capacity: 11 });
			expect.assertions(1);
			try{
				await queue.drop();
			} catch(error) {
				expect(error.message).toBe('Must be implemented by subclass');
			}
		});

		it('pull', async () => {
			const queue = new Queue({ capacity: 11 });
			expect.assertions(1);
			try{
				await queue.pull();
			} catch(error) {
				expect(error.message).toBe('Must be implemented by subclass');
			}
		});

		it('size getter', async () => {
			const queue = new Queue({ capacity: 11 });
			expect.assertions(1);
			try{
				await  queue.size();
			} catch(error) {
				expect(error.message).toBe('Must be implemented by subclass');
			}
		});

		it('requeue will not throw because we are not enforcing this method (but we need it for setting the queue type)', () => {
			const queue = new Queue({ capacity: 11 });
			expect.assertions(1);
			expect(async() => await queue.requeue()).not.toThrow();
		});
	});
});
