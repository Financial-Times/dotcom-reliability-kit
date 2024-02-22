const Logger = require('./logger');
const legacyMask = require('./transforms/legacy-mask');

class DefaultLogger extends Logger {
	transforms = { legacyMask };
	Logger = Logger;
}

exports = module.exports = new DefaultLogger();
exports.default = exports;
