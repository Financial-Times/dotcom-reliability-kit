const { Queue } = require('./queue');

/**
 * @import { LocalStorageQueue, Metric, LocalStorageQueue as LocalStorageQueueType} from '@dotcom-reliability-kit/client-metrics-web'
 */
exports.LocalStorageQueue = class LocalStorageQueue extends Queue {
	// TODO: define if we check the size in bytes of the value in local storage (if yes, we might need a helper method getStringSize(value) for ex)
	// or if we just define how many events we want (like in InMemory)
	MAX_STORAGE_CAPACITY = '2.5MB'

	// Potential helpers
	#metricToString() {}

	#stringToMetrics() {}

}
