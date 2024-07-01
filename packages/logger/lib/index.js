const Logger = require('./logger');
const legacyMask = require('./transforms/legacy-mask');

/**
 * @import { DefaultLogger, Transforms } from '@dotcom-reliability-kit/logger'
 */

/** @type {Transforms} */
const transforms = { legacyMask };

/** @type {Logger & DefaultLogger} */
exports = module.exports = new Logger();
exports.Logger = Logger;
exports.transforms = transforms;

// @ts-ignore
exports.default = exports;
