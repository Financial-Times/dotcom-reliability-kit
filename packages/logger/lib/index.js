import Logger from './logger.js';
import legacyMask from './transforms/legacy-mask.js';

export const transforms = { legacyMask };
export { Logger };

const logger = new Logger();
export default logger;
