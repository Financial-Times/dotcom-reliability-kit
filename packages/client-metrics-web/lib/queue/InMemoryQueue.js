const { Queue } = require('./Queue');

/**
 * @import { QueueOptions, Metric } from '@dotcom-reliability-kit/client-metrics-web'
 */

exports.InMemoryQueue = class InMemoryQueue extends Queue {
	/** @type { Metric[] } */
	#queue;

	/**
	 * @param {QueueOptions} options
	 */
	constructor(options) {
		super({ capacity: options.capacity });
		this.#queue = [];
	}

	/**
	 * @override
	 */
	add(item) {
		if (this.#queue.length >= this.capacity) {
			this.drop();
		}

		this.#queue.push(item);
	}

	/**
	 * @override
	 */
	clear() {
		this.#queue = [];
	}

	/**
	 * @override
	 */
	drop(count = 1) {
		this.#queue = this.#queue.slice(count);
		// TODO: document its from the oldest
	}

	/**
	 * @override
	 */
	getItems(count) {
		if (count > this.size) {
			throw new Error(`Queue.size is ${this.size} so it can't get ${count} items.`);
		}

		return this.#queue.slice(0, count);
	}

	/**
	 * @override
	 */
	pull(count) {
		if (count > this.size) {
			throw new Error(`Queue.size is ${this.size} so it can't pull ${count} items.`);
		}
		return this.#queue.splice(0, count);
	}

	/**
	 * @override
	 */
	get size() {
		return this.#queue.length;
	}
};
