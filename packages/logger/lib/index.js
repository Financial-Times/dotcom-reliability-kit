const Logger = require('./logger');

module.exports = new Logger();

module.exports.Logger = Logger;

module.exports.transforms = {
	legacyMask: require('./transforms/legacy-mask')
};

// @ts-ignore
module.exports.default = module.exports;
