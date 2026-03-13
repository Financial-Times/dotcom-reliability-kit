import type { LogTransform } from '../logger.d.ts';

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

export default function createLegacyMaskTransform(
	options?: LegacyMaskTransformOptions
): LogTransform;
