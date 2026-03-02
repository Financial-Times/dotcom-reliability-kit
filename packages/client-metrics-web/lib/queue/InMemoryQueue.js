const { Queue } = require('./Queue');

/**
 * @import { QueueOptions, Queue as QueueType, Metric } from '@dotcom-reliability-kit/client-metrics-web'
 */

exports.InMemoryQueue = class InMemoryQueue extends Queue {
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
	 * @type {QueueType['add']}
	 */
	add(item) {
		if (this.#queue.length >= this.capacity) {
			this.drop();
		}

		this.#queue.push(item);
	}

	/**
	 * @override
	 * @type {QueueType['clear']}
	 */
	clear() {
		this.#queue = [];
	}

	/**
	 * @override
	 * @type {QueueType['drop']}
	 */
	drop(count = 1) {
		this.#queue = this.#queue.slice(count);
		// TODO: document its from the oldest
	}

	/**
	 * @override
	 * @type {QueueType['pull']}
	 */
	pull(count = 0) {
		if (count > this.size) {
			throw new Error(`Queue.size is ${this.size} so it can't pull ${count} items.`);
		}
		return this.#queue.splice(0, count);
	}

	/**
	 * @override
	 * @type {QueueType['size']}
	 */
	get size() {
		return this.#queue.length;
	}
};
