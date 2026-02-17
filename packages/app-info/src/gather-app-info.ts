// This package relies on Heroku and AWS Lambda environment variables.
// Documentation for these variables is available here:
//
//   - Heroku: https://devcenter.heroku.com/articles/dyno-metadata
//   - Lambda: https://docs.aws.amazon.com/lambda/latest/dg/configuration-envvars.html
import { randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import path from 'node:path';

interface SemanticConventions {
	cloud: {
		provider?: string;
		region?: string;
	};
	deployment: {
		environment: string;
	};
	service: {
		name?: string;
		version?: string;
		instance: {
			id: string;
		};
	};
}

interface Options {
	env: typeof process.env;
	rootPath: string;
}

interface PackageManifest {
	name: unknown;
	version: unknown;
}

export interface AppInfo {
	systemCode: string | null;
	processType: string | null;
	commitHash: string | null;
	environment: string;
	region: string | null;
	releaseDate: string | null;
	releaseVersion: string | null;
	cloudProvider: string | null;
	herokuAppId: string | null;
	herokuDynoId: string | null;
	instanceId: string;
	semanticConventions: SemanticConventions;
}

/** Gather up app info from a file system and process */
export default function gatherAppInfo({ env, rootPath }: Options): Readonly<AppInfo> {
	let manifest: null | PackageManifest = null;
	try {
		manifest = JSON.parse(readFileSync(path.join(rootPath, 'package.json'), 'utf-8'));
	} catch (_) {}

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

	const manifestVersion = typeof manifest?.version === 'string' ? manifest.version : null;

	// The dyno process type
	const processType = env.AWS_LAMBDA_FUNCTION_NAME || env.DYNO?.split('.')[0] || null;

	let cloudProviderName: null | string = null;
	if (env.AWS_LAMBDA_FUNCTION_NAME || env.HAKO_SERVICE_URL) {
		cloudProviderName = 'aws';
	}
	if (env.HEROKU_RELEASE_CREATED_AT) {
		cloudProviderName = 'heroku';
	}

	// The cloud provider type
	const cloudProvider = cloudProviderName;

	// The application commit hash
	const commitHash = env.HEROKU_SLUG_COMMIT || env.GIT_COMMIT_LONG || env.GIT_COMMIT || null;

	// The application deployment environment
	const environment =
		env.DEPLOYMENT_ENVIRONMENT ||
		env.RELEASE_ENV ||
		env.ENVIRONMENT ||
		env.NODE_ENV ||
		'development';

	// The region the application is running in
	const region = env.REGION || env.AWS_REGION || null;

	// The date and time that the application was last released at
	const releaseDate = env.HEROKU_RELEASE_CREATED_AT || null;

	// The last released version of the application
	const releaseVersion =
		env.HEROKU_RELEASE_VERSION || env.AWS_LAMBDA_FUNCTION_VERSION || manifestVersion;

	// The application system code
	const systemCode = env.SYSTEM_CODE || manifestName;

	// The Heroku application Id
	const herokuAppId = env.HEROKU_APP_ID || null;

	// The Heroku dyno Id
	const herokuDynoId = env.HEROKU_DYNO_ID || null;

	// The ID of the running instance of the service
	const instanceId = randomUUID();

	// The rest of the data in an OpenTelemetry semantic convention structure
	const semanticConventions = {
		cloud: {
			provider: cloudProvider || undefined,
			region: region || undefined
		},
		deployment: {
			environment: environment
		},
		service: {
			name: systemCode || undefined,
			version: releaseVersion || undefined,
			instance: {
				id: instanceId
			}
		}
	};

	return Object.freeze({
		cloudProvider,
		commitHash,
		environment,
		herokuAppId,
		herokuDynoId,
		instanceId,
		processType,
		region,
		releaseDate,
		releaseVersion,
		semanticConventions,
		systemCode
	});
}
