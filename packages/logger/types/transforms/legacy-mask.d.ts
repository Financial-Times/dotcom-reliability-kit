import { LogTransform } from '../logger';

export type LegacyMaskTransformOptions = {
	denyList?: string[];
	allowList?: string[];
	maskString?: string;
};

export type InternalMaskSettings = {
	maskedFields: Set<string>;
	maskRegExp: RegExp;
	maskString: string;
	references: WeakSet<{ [key: string]: any }>;
};

export type createLegacyMaskTransform = (options?: LegacyMaskTransformOptions) => LogTransform;
