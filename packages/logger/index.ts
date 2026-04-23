import Logger from './lib/logger.ts';
import legacyMask from './lib/transforms/legacy-mask.ts';

export const transforms = { legacyMask };
export { Logger };

const logger = new Logger();
export default logger;
