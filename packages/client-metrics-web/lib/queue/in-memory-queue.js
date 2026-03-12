import { Queue } from './queue.js';

/**
 * @import { QueueOptions, Metric, InMemoryQueue as InMemoryQueueType} from '@dotcom-reliability-kit/client-metrics-web'
 */
export class InMemoryQueue extends Queue {
	/** @type { Metric[] } */
	#queue;

	/**
	 * @param {QueueOptions} [options]
	 */
	constructor(options) {
		super(options);
		this.#queue = [];
	}

	/**
	 * @override
	 * @type {InMemoryQueueType['add']}
	 */
	add(item) {
		if (this.#queue.length >= this.capacity) {
			this.drop();
		}

		this.#queue.push(Object.freeze(item));
	}

	/**
	 * @override
	 * @type {InMemoryQueueType['drop']}
	 * This method is dropping the oldest item(s) from the queue
	 */
	drop(count = 1) {
		this.#queue = this.#queue.slice(count);
	}

	/**
	 * @override
	 * @type {InMemoryQueueType['pull']}
	 */
	pull(count = 1) {
		return this.#queue.splice(0, count);
	}

	/**
	 * @override
	 * @type {InMemoryQueueType['size']}
	 */
	get size() {
		return this.#queue.length;
	}
};
