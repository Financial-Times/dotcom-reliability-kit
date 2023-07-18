/**
 * Find the first log in an array of logs which has the
 * specified `property` set to `value`.
 *
 * @param {{[key: string]: any}[]} logs
 *     The logs to search.
 * @param {string} property
 *     The property to search on.
 * @param {any} value
 *     The property value to find.
 * @returns {{[key: string]: any}|null}
 *     Returns the found log or null if one isn't found.
 */
function findLogWithPropertyValue(logs, property, value) {
	return logs.find((log) => log[property] === value) || null;
}

module.exports = findLogWithPropertyValue;
