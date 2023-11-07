const path = require('node:path');

// This package relies on Heroku and AWS Lambda environment variables.
// Documentation for these variables is available here:
//
//   - Heroku: https://devcenter.heroku.com/articles/dyno-metadata
//   - Lambda: https://docs.aws.amazon.com/lambda/latest/dg/configuration-envvars.html

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

/**
 * Extract the proceess type from a Heroku dyno name.
 *
 * @param {string} dyno
 *     The dyno name to normalize.
 * @returns {string}
 *     Returns the process type of a dyno, e.g. `web` for a dyno called `web.1`.
 */
function normalizeHerokuProcessType(dyno) {
	return dyno.split('.')[0];
}

const systemCode =
	process.env.SYSTEM_CODE || getSystemCodeFromPackage(process.cwd()) || null;

const processType =
	process.env.AWS_LAMBDA_FUNCTION_NAME ||
	(process.env.DYNO && normalizeHerokuProcessType(process.env.DYNO)) ||
	null;

/**
 * Sets the cloud provider type.
 *
 * @returns {string | null}
 *     Returns the cloud provider type (either aws or heroku).
 */
const cloudProvider = () => {
	if (process.env.AWS_LAMBDA_FUNCTION_NAME) {
		return 'aws';
	}
	if (process.env.HEROKU_RELEASE_CREATED_AT) {
		return 'heroku';
	}
	return null;
};

module.exports = {
	/**
	 * The application commit hash.
	 *
	 * @readonly
	 * @type {string | null}
	 */
	commitHash:
		process.env.HEROKU_SLUG_COMMIT ||
		process.env.GIT_COMMIT_LONG ||
		process.env.GIT_COMMIT ||
		null,

	/**
	 * The application environment.
	 *
	 * @readonly
	 * @type {string}
	 */
	environment: process.env.NODE_ENV || 'development',

	/**
	 * The region the application is running in.
	 *
	 * @readonly
	 * @type {string | null}
	 */
	region: process.env.REGION || process.env.AWS_REGION || null,

	/**
	 * The date and time that the application was last released at.
	 *
	 * @readonly
	 * @type {string | null}
	 */
	releaseDate: process.env.HEROKU_RELEASE_CREATED_AT || null,

	/**
	 * The last released version of the application.
	 *
	 * @readonly
	 * @type {string | null}
	 */
	releaseVersion:
		process.env.HEROKU_RELEASE_VERSION ||
		process.env.AWS_LAMBDA_FUNCTION_VERSION ||
		null,

	/**
	 * The application system code.
	 *
	 * @readonly
	 * @type {string | null}
	 */
	systemCode,

	/**
	 * The dyno process type.
	 *
	 * @readonly
	 * @type {string | null}
	 */
	processType,

	/**
	 * The cloud provider type.
	 *
	 * @readonly
	 * @type {string | null}
	 */
	cloudProvider: cloudProvider()
};

// @ts-ignore
module.exports.default = module.exports;
Object.freeze(module.exports);
