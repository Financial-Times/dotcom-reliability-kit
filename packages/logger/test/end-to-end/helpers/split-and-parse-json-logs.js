/**
 * Split a log string by line breaks and parse any JSON logs.
 *
 * @param {string} logString
 *     The log string to parse.
 * @returns {Array<Object<string, any>>}
 *     Returns the parsed JSON logs as an array of log objects.
 */
function splitAndParseJsonLogs(logString) {
	return logString
		.trim()
		.split(/\n+/g)
		.filter((log) => log.trim())
		.map((log) => JSON.parse(log));
}

module.exports = splitAndParseJsonLogs;
