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

/** @type {Transforms} */
const transforms = { legacyMask };

/** @type {Logger & DefaultLogger} */
exports = module.exports = new Logger();
exports.Logger = Logger;
exports.transforms = transforms;

// @ts-ignore
exports.default = exports;
