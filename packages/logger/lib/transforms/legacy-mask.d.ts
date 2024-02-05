
export = createLegacyMaskTransform;
declare function createLegacyMaskTransform(options?: LegacyMaskTransformOptions): import('../logger').LogTransform;
declare namespace createLegacyMaskTransform {
    export { exports as default, LegacyMaskTransformOptions, InternalMaskSettings };
}
type LegacyMaskTransformOptions = {
    denyList?: string[] | undefined;
    allowList?: string[] | undefined;
    maskString?: string | undefined;
};
declare namespace exports {
    export { exports as default, LegacyMaskTransformOptions, InternalMaskSettings };
}
type InternalMaskSettings = {
    maskedFields: Set<string>;
    maskRegExp: RegExp;
    maskString: string;
    references: WeakSet<any>;
};
