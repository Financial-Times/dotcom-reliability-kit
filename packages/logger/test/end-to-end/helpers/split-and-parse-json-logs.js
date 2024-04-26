/**
 * Split a log string by line breaks and parse any JSON logs.
 *
 * @param {string} logString
 *     The log string to parse.
 * @returns {{[key: string]: any}[]}
 *     Returns the parsed JSON logs as an array of log objects.
 */
function splitAndParseJsonLogs(logString) {
	return (
		logString
			.trim()
			.split(/\n+/g)
			.filter((log) => log.trim())
			// Node.js sometimes logs deprecation warnings which are not valid JSON.
			// We need to filter these out so we don't error in our JSON.parse map
			.filter((log) => !log.toLowerCase().includes('deprecation'))
			.map((log) => JSON.parse(log))
	);
}

module.exports = splitAndParseJsonLogs;
