/**
 * @import { QueueOptions, Queue as QueueType } from '@dotcom-reliability-kit/client-metrics-web'
 */

const DEFAULT_QUEUE_CAPACITY = 10_000;

export class Queue {
	/** @type { number } */
	#capacity;

	/**
	 * @param {QueueOptions} [options]
	 */
	constructor(options = {}) {
		this.#capacity = options.capacity || DEFAULT_QUEUE_CAPACITY;
	}

	/**
	 * @type {QueueType['add']}
	 */
	add(_item) {
		throw new Error('Must be implemented by subclass');
	}

	/**
	 * @type {QueueType['drop']}
	 */
	drop(_count) {
		throw new Error('Must be implemented by subclass');
	}

	/**
	 * @type {QueueType['pull']}
	 */
	pull(_count) {
		throw new Error('Must be implemented by subclass');
	}

	/**
	 * @type {QueueType['capacity']}
	 */
	get capacity() {
		return this.#capacity;
	}

	/**
	 * @type {QueueType['size']}
	 */
	get size() {
		throw new Error('Must be implemented by subclass');
	}
};
