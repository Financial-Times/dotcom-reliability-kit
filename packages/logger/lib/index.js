const Logger = require('./logger');
const legacyMask = require('./transforms/legacy-mask');

/**
 * @typedef {import('@dotcom-reliability-kit/logger').DefaultLogger} DefaultLogger
 * @typedef {import('@dotcom-reliability-kit/logger').Transforms} Transforms
 */

/** @type {Transforms} */
const transforms = { legacyMask };

/** @type {Logger & DefaultLogger} */
exports = module.exports = new Logger();
exports.Logger = Logger;
exports.transforms = transforms;

// @ts-ignore
exports.default = exports;
