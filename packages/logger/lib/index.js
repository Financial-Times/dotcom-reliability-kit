const Logger = require('./logger.js');
const legacyMask = require('./transforms/legacy-mask.js');

/**
 * @import { DefaultLogger, Transforms } from '@dotcom-reliability-kit/logger'
 */

/** @type {Transforms} */
const transforms = { legacyMask };

/** @type {Logger & DefaultLogger} */
module.exports = new Logger();
module.exports.Logger = Logger;
module.exports.transforms = transforms;

// @ts-expect-error
module.exports.default = module.exports;
