const { LocalStorageQueue } = require('../../../../lib/queue/local-storage-queue');

describe('InMemoryQueue (extends Queue)', () => {
	it('instanciate a new queue if localStorage is available');
	it('throws and does not instanciate a queue if localStorage is unavailable');

	// example key = client-metrics-next-article
	it('uses the systemCode to construct the key for localStorage');
	
	it('throws if trying to instanciate a queue bigger than the max size');
	
	// with localStorage, this means get the items already stored, concat the new item, 
	// put everything back in storage as an array
	it('adds an item to the queue');

	// We can use an internal check for the size of the local storage
	it('drops the oldest item when trying to add an item to a queue that has reached max capacity');

	it('drop the oldest item if localStorage.setItem throw a QuotaExceededError (and retry to add the new item?');

	// with localStorage, this means get the items already stored, turn it into an array of metrics (or string)
	// put back in storage a string of the total - x element 
	it('drop the oldest item if the queue has reached max capacity');

	// with localStorage, this means get the items already stored, turn it into an array of metrics, 
	// return the first item (as a metric object), put back the rest to storage (as a string)
	it('returns at least one item from the queue');
});

