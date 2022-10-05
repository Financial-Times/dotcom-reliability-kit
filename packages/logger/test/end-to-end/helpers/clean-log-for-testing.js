/**
 * Remove properties from a log object which cause
 * issues in testing.
 *
 * @param {Object<string, any>} log
 *     The log object to clean.
 * @returns {Object<string, any>}
 *     Returns the cleaned log.
 */
function cleanLogFortesting(log) {
	// The `_logger` property is used to temporarily indicate which
	// logger output a specific log. It's not required during testing.
	delete log._logger;

	// The error stack properties are not comparable, and won't be
	// consistent between machines or local vs CI
	delete log.error?.stack;
	delete log.error_stack;

	// The `time` property cannot be tested because it's always
	// going to be different
	delete log.time;

	return log;
}

module.exports = cleanLogFortesting;
