const Logger = require('./logger');

module.exports = new Logger();

module.exports.Logger = Logger;

// @ts-ignore
module.exports.default = module.exports;
