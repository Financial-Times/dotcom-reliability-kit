const path = require('node:path');
const { randomUUID } = require('node:crypto');

// This package relies on Heroku and AWS Lambda environment variables.
// Documentation for these variables is available here:
//
//   - Heroku: https://devcenter.heroku.com/articles/dyno-metadata
//   - Lambda: https://docs.aws.amazon.com/lambda/latest/dg/configuration-envvars.html

/** @type {null | any} */
let manifest = null;
try {
	manifest = require(path.join(process.cwd(), 'package.json'));
} catch (error) {}

/** @type {string | null} */
const manifestName =
	typeof manifest?.name === 'string'
		? // Remove a prefix of "ft-", this is a hangover and we have plenty of
			// apps which use this prefix but their system code does not include
			// it. E.g. MyFT API has a system code of "next-myft-api", but a
			// package.json `name` field of "ft-next-myft-api"
			//    - https://biz-ops.in.ft.com/System/next-myft-api
			//    - https://github.com/Financial-Times/next-myft-api/blob/main/package.json
			//
			manifest.name.replace(/^ft-/, '')
		: null;

/** @type {string | null} */
const manifestVersion =
	typeof manifest?.version === 'string' ? manifest.version : null;

/**
 * Extract the process type from a Heroku dyno name.
 *
 * @param {string} dyno
 *     The dyno name to normalize.
 * @returns {string}
 *     Returns the process type of a dyno, e.g. `web` for a dyno called `web.1`.
 */
function normalizeHerokuProcessType(dyno) {
	return dyno.split('.')[0];
}

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

/**
 * The application commit hash.
 *
 * @readonly
 * @type {string | null}
 */
exports.commitHash =
	process.env.HEROKU_SLUG_COMMIT ||
	process.env.GIT_COMMIT_LONG ||
	process.env.GIT_COMMIT ||
	null;

/**
 * The application environment.
 *
 * @readonly
 * @type {string}
 */
exports.environment = process.env.NODE_ENV || 'development';

/**
 * The region the application is running in.
 *
 * @readonly
 * @type {string | null}
 */
exports.region = process.env.REGION || process.env.AWS_REGION || null;

/**
 * The date and time that the application was last released at.
 *
 * @readonly
 * @type {string | null}
 */
exports.releaseDate = process.env.HEROKU_RELEASE_CREATED_AT || null;

/**
 * The last released version of the application.
 *
 * @readonly
 * @type {string | null}
 */
exports.releaseVersion =
	process.env.HEROKU_RELEASE_VERSION ||
	process.env.AWS_LAMBDA_FUNCTION_VERSION ||
	manifestVersion;

/**
 * The application system code.
 *
 * @readonly
 * @type {string | null}
 */
exports.systemCode = process.env.SYSTEM_CODE || manifestName;

/**
 * The dyno process type.
 *
 * @readonly
 * @type {string | null}
 */
exports.processType = processType;

/**
 * The cloud provider type.
 *
 * @readonly
 * @type {string | null}
 */
exports.cloudProvider = cloudProvider();

/**
 * The heroku application Id.
 *
 * @readonly
 * @type {string | null}
 */
exports.herokuAppId = process.env.HEROKU_APP_ID || null;

/**
 * The heroku dyno Id.
 *
 * @readonly
 * @type {string | null}
 */
exports.herokuDynoId = process.env.HEROKU_DYNO_ID || null;

/**
 * The ID of the running instance of the service.
 *
 * @readonly
 * @type {string}
 */
exports.instanceId = process.env.HEROKU_DYNO_ID || randomUUID();

/**
 * @type {import('@dotcom-reliability-kit/app-info').SemanticConventions}
 */
exports.semanticConventions = {
	cloud: {
		provider: exports.cloudProvider,
		region: exports.region
	},
	deployment: {
		environment: exports.environment
	},
	service: {
		name: exports.systemCode,
		version: exports.releaseVersion,
		instance: {
			id: exports.instanceId
		}
	}
};

// @ts-ignore
module.exports.default = module.exports;
module.exports = Object.freeze(module.exports);
