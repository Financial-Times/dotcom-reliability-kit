const Logger = require('./logger');
const legacyMask = require('./transforms/legacy-mask');

/**
 * @typedef {object} Transforms
 * @property {legacyMask} legacyMask
 *     The legacy mask logger.
 */

/**
 * @typedef {object} DefaultLogger
 * @property {typeof Logger} Logger
 *     The Logger class.
 * @property {Transforms} transforms
 *     Built-in log transforms.
 */

/**
 * @type {Logger & DefaultLogger}
 */
module.exports = new Logger();

module.exports.Logger = Logger;

module.exports.transforms = { legacyMask };

// @ts-ignore
module.exports.default = module.exports;
