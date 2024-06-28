import { Logger } from './logger';
import { createLegacyMaskTransform } from './transforms/legacy-mask';

declare module '@dotcom-reliability-kit/logger' {
	export type Transforms = {
		legacyMask: typeof createLegacyMaskTransform;
	};

	export type DefaultLogger = {
		Logger: typeof Logger;
		transforms: Transforms;
	};

	export const transforms: Transforms;
	export { Logger };

	declare const _exports: Logger & DefaultLogger;
	export = _exports;
	export default _exports;
}
