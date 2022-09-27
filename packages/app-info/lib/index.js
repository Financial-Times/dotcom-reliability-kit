/**
 * @module @dotcom-reliability-kit/app-info
 */

const path = require('path');

/**
 * Get the application system code from a package.json file.
 *
 * @param {string} directoryPath
 *     The directory to look for a package.json file in.
 * @returns {(string | null)}
 *     Returns a system code if one is found in `process.env`.
 */
function getSystemCodeFromPackage(directoryPath) {
	try {
		const manifest = require(path.join(directoryPath, 'package.json'));
		return typeof manifest?.name === 'string'
			? normalizePackageName(manifest.name)
			: null;
	} catch (error) {}
	return null;
}

/**
 * Normalize the name property of a package.json file.
 *
 * @param {string} name
 *     The name to normalize.
 * @returns {string}
 *     Returns a normalized copy of the package name.
 */
function normalizePackageName(name) {
	// Remove a prefix of "ft-", this is a hangover and we have plenty of
	// apps which use this prefix but their system code does not include
	// it. E.g. MyFT API has a system code of "next-myft-api", but a
	// package.json `name` field of "ft-next-myft-api"
	//    - https://biz-ops.in.ft.com/System/next-myft-api
	//    - https://github.com/Financial-Times/next-myft-api/blob/main/package.json
	//
	return name.replace(/^ft-/, '');
}

const systemCode =
	process.env.SYSTEM_CODE || getSystemCodeFromPackage(process.cwd()) || null;

module.exports = {
	/**
	 * @readonly
	 * @access public
	 * @type {(string | null)}
	 */
	get commitHash() {
		return process.env.HEROKU_SLUG_COMMIT || null;
	},

	/**
	 * @readonly
	 * @access public
	 * @type {string}
	 */
	get environment() {
		return process.env.NODE_ENV || 'development';
	},

	/**
	 * @readonly
	 * @access public
	 * @type {(string | null)}
	 */
	get region() {
		return process.env.REGION || null;
	},

	/**
	 * @readonly
	 * @access public
	 * @type {(string | null)}
	 */
	get releaseDate() {
		return process.env.HEROKU_RELEASE_CREATED_AT || null;
	},

	/**
	 * @readonly
	 * @access public
	 * @type {(string | null)}
	 */
	get releaseVersion() {
		return process.env.HEROKU_RELEASE_VERSION || null;
	},

	/**
	 * @readonly
	 * @access public
	 * @type {(string | null)}
	 */
	get systemCode() {
		return systemCode;
	}
};

// @ts-ignore
module.exports.default = module.exports;
