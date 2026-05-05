/**
 * @import { QueueOptions, Queue as QueueType } from '@dotcom-reliability-kit/client-metrics-web'
 */

const DEFAULT_QUEUE_CAPACITY = 10_000;

exports.Queue = class Queue {
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
	async add(_item) {
		throw new Error('Must be implemented by subclass');
	}

	/**
	 * @type {QueueType['drop']}
	 */
	async drop(_count) {
		throw new Error('Must be implemented by subclass');
	}

	/**
	 * @type {QueueType['pull']}
	 */
	async pull(_count) {
		throw new Error('Must be implemented by subclass');
	}

	/**
	 * To avoid breaking change, this won't throw an error but it should be added at the next possible occasion
	 * If you do not implement that method, the events that were not sent are just lost
	 * @type {QueueType['requeue']}
	 */
	async requeue(_items) {}

	/**
	 * @type {QueueType['size']}
	 */
	async size() {
		throw new Error('Must be implemented by subclass');
	}

	/**
	 * @type {QueueType['capacity']}
	 */
	get capacity() {
		return this.#capacity;
	}
};
