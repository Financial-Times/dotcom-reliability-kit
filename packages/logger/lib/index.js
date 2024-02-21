const Logger = require('./logger');
const legacyMask = require('./transforms/legacy-mask');

exports = module.exports = new Logger();
exports.Logger = Logger;
exports.transforms = { legacyMask };

exports.default = exports;
