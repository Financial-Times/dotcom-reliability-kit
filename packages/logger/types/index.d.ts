import Logger from './logger.d.ts';
import createLegacyMaskTransform from './transforms/legacy-mask.d.ts';

declare module '@dotcom-reliability-kit/logger' {
	export const transforms = { legacyMask: createLegacyMaskTransform };
	export { Logger };

	const logger = new Logger();
	export default logger;
}
