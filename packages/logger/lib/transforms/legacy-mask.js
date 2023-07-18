/**
 * @typedef {object} LegacyMaskTransformOptions
 * @property {string[]} [denyList]
 *     Additional field names to apply masking to.
 * @property {string[]} [allowList]
 *     Field names to allow from the default deny list.
 * @property {string} [maskString]
 *     The mask string to apply to discovered sensitive values.
 */

/**
 * @typedef {object} InternalMaskSettings
 * @property {Set<string>} maskedFields
 *     Field names to mask.
 * @property {RegExp} maskRegExp
 *     A regular expression which applies masking to a string.
 * @property {string} maskString
 *     The mask string to apply to discovered sensitive values.
 * @property {WeakSet} references
 *     An internal store of references used to avoid masking the same object infinitely.
 */

/**
 * The default masked fields.
 *
 * @private
 * @type {string[]}
 */
const DEFAULT_MASKED_FIELDS = [
	'email',
	'password',
	'firstName',
	'lastName',
	'phone',
	'primaryTelephone',
	'postcode',
	'session',
	'sessionId',
	'ft-session-id',
	'FTSession_s',
	'FTSession',
	'ft-backend-key'
];

/**
 * Properties of an error object we need to mask.
 *
 * @private
 * @type {string[]}
 */
const ERROR_OBJECT_PROPERTIES = [
	'name',
	'message',
	'fileName',
	'lineNumber',
	'columnNumber',
	'stack'
];

/**
 * Mask an unknown value.
 *
 * @param {any} value
 *     The value to mask.
 * @param {InternalMaskSettings} settings
 *     The settings to use for masking.
 * @returns {any}
 *     Returns the masked value.
 */
function mask(value, settings) {
	if (typeof value === 'string') {
		return maskString(value, settings);
	}

	// Handle circular references
	if (value && typeof value === 'object') {
		if (settings.references.has(value)) {
			return value;
		}
		settings.references.add(value);
	}

	if (Array.isArray(value)) {
		return value.map((item) => mask(item, settings));
	}
	if (typeof value === 'object' && value !== null) {
		return maskObject(value, settings);
	}
	return value;
}

/**
 * Mask a string.
 *
 * @param {string} string
 *     The string to mask.
 * @param {InternalMaskSettings} settings
 *     The settings to use for masking.
 * @returns {string}
 *     Returns the masked string.
 */
function maskString(string, settings) {
	// Guess to see if string is stringified JSON and parse as object for better masking
	if (string.startsWith('{')) {
		try {
			const json = JSON.parse(string);
			return JSON.stringify(mask(json, settings));
		} catch (_) {}
	}

	// Capture group of the maskRegex should contain the sensitive value
	// replace this with the maskString to remove the sensitive information
	return string.replace(settings.maskRegExp, (match, captureGroup) => {
		return match.replace(captureGroup, settings.maskString);
	});
}

/**
 * Mask properties and values of an object.
 *
 * @param {object} object
 *     The object to mask.
 * @param {InternalMaskSettings} settings
 *     The settings to use for masking.
 * @returns {object}
 *     Returns the masked object.
 */
function maskObject(object, settings) {
	// Make a new object rather than modifying the original
	// which could have some side effects
	const maskedObject = {};

	// Loop over object properties to mask all keys and values
	for (let key in object) {
		// If the key is sensitive mask the value entirely
		if (settings.maskedFields.has(key)) {
			maskedObject[key] = settings.maskString;
		} else {
			// If the key is not sensitive run the mask on it's value
			maskedObject[key] = mask(object[key], settings);
		}
	}

	// Standard error properties are not iterable so add them separately.
	// It's unlikely that we come across an error because n-logger explicitly
	// disallows them as property values. We do this for compatibility with
	// n-mask-logger just in case.
	if (object instanceof Error) {
		for (const errorProperty of ERROR_OBJECT_PROPERTIES) {
			const value = mask(object[errorProperty], settings);
			if (value) {
				maskedObject[errorProperty] = value;
			}
		}
	}

	return maskedObject;
}

/**
 * Create a log transform function which masks sensitive fields in log data.
 *
 * @param {LegacyMaskTransformOptions} options
 *     Masking options.
 * @returns {import('../logger').LogTransform}
 *     Returns a transform function for use with the logger.
 */
function createLegacyMaskTransform({
	denyList = [],
	allowList = [],
	maskString = '*****'
} = {}) {
	// Deduplicate the mask list and filter out explicitly allowed values
	const maskedFields = new Set(
		[...DEFAULT_MASKED_FIELDS, ...denyList].filter(
			(item) => !allowList.includes(item)
		)
	);

	// Regular expression defined in a string has to have escaped characters escaped
	// Value regex is space delimited meaning it will stop searching the value if a space is found
	// A sensitive value that contains a space will only be partially masked
	const valueRegExp = '[\'"\\s]*[=:][\\s]*([\\S]+)[\\]\\["\'{}]?';
	const fieldRegExp = `(?:${[...maskedFields].join('|')})`;
	const maskRegExp = new RegExp(`${fieldRegExp}${valueRegExp}`, 'ig');

	return function maskSensitiveData(logData) {
		return maskObject(logData, {
			maskedFields,
			maskRegExp,
			maskString,
			references: new WeakSet()
		});
	};
}

module.exports = createLegacyMaskTransform;

// @ts-ignore
module.exports.default = module.exports;
