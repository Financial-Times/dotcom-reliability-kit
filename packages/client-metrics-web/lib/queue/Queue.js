/**
 * @import { Metric, QueueOptions } from '@dotcom-reliability-kit/client-metrics-web'
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

	/**
	 * @param {Metric} _item
	 * @returns {void}
	 * @abstract
	 */
	add(_item) {
		throw new Error('Must be implemented by subclass');
	}

	/**
	 * @returns {void}
	 * @abstract
	 */
	clear() {
		throw new Error('Must be implemented by subclass');
	}

	/**
	 * @param {number} _count
	 * @returns {void}
	 * @abstract
	 */
	drop(_count = 1) {
		throw new Error('Must be implemented by subclass');
	}

	/**
	 * @param {number} _count
	 * @returns {Metric[]}
	 * @abstract
	 */
	getItems(_count) {
		throw new Error('Must be implemented by subclass');
	}

	/**
	 * @param {number} _count
	 * @returns {Metric[]}
	 * @abstract
	 */
	pull(_count) {
		throw new Error('Must be implemented by subclass');
	}

	/**
	 * @returns {number}
	 */
	get capacity() {
		return this.#capacity;
	}

	/**
	 * @returns {number}
	 * @abstract
	 */
	get size() {
		throw new Error('Must be implemented by subclass');
	}
};
