/**
 * @import { Metric, Queue as QueueType, QueueOptions } from '@dotcom-reliability-kit/client-metrics-web'
 */

const defaultQueueCapacity = 10_000;

/** @extends {QueueType} */
exports.Queue = class Queue {
	/** @type { number } */
	#capacity;

	/**
	 * @param {QueueOptions} [options]
	 */
	constructor(options = {}) {
		this.#capacity = options.capacity || defaultQueueCapacity;
	}

	/** @type {QueueType['add']} */
	add(_item) {
		throw new Error('Must be implemented by subclass');
	}

	/** @type {QueueType['clear']} */
	clear() {
		throw new Error('Must be implemented by subclass');
	}

	/** @type {QueueType['drop']} */
	drop(_count) {
		throw new Error('Must be implemented by subclass');
	}

	/** @type {QueueType['pull']} */
	pull(_count) {
		throw new Error('Must be implemented by subclass');
	}

	/** @type {QueueType['capacity']} */
	get capacity() {
		return this.#capacity;
	}

	/** @type {QueueType['size']} */
	get size() {
		throw new Error('Must be implemented by subclass');
	}
};
