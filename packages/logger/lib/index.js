const Logger = require('./logger');
const legacyMask = require('./transforms/legacy-mask');

/**
 * @typedef {object} Transforms
 * @property {legacyMask} legacyMask
 *     The legacy mask logger.
 */

/** @type {Transforms} */
const transforms = { legacyMask };

exports = module.exports = new Logger();
exports.Logger = Logger;
exports.transforms = transforms;

exports.default = exports;
