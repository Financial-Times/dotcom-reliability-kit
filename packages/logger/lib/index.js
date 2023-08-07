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
const defaultLogger = Object.assign(new Logger(), {
	Logger,
	transforms
});

module.exports = defaultLogger;

// @ts-ignore
module.exports.default = module.exports;
