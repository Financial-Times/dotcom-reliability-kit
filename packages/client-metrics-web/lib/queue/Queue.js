/**
 * @import { QueueOptions, Queue as QueueType } from '@dotcom-reliability-kit/client-metrics-web'
 */

exports.Queue = class Queue {
	/** @type { number } */
	#capacity;

	/**
	 * @param {QueueOptions} options
	 */
	constructor(options) {
		this.#capacity = options.capacity;
	}

	/** @type { QueueType['add'] } */
	add(_item) {
		throw new Error('Not implemented');
	}

	/** @type { QueueType['clear'] } */
	clear() {
		throw new Error('Not implemented');
	}

	/** @type { QueueType['drop'] } */
	drop(_count = 1) {
		throw new Error('Not implemented');
	}

	/** @type { QueueType['pull'] } */
	pull(_count) {
		return [];
	}

	/** @type { QueueType['capacity'] } */
	get capacity() {
		return this.#capacity;
	}

	/** @type { QueueType['size'] } */
	get size() {
		return 0;
	}
}
