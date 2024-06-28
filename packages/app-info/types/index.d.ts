declare module '@dotcom-reliability-kit/app-info' {
	export const systemCode: string | null;
	export const processType: string | null;
	export const commitHash: string | null;
	export const environment: string;
	export const region: string | null;
	export const releaseDate: string | null;
	export const releaseVersion: string | null;
	export const cloudProvider: string | null;
	export const herokuAppId: string | null;
	export const herokuDynoId: string | null;
	export const instanceId: string;
	export const semanticConventions: SemanticConventions;

	export type SemanticConventions = {
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
	};

	type appInfo = {
		systemCode: typeof systemCode;
		processType: typeof processType;
		commitHash: typeof commitHash;
		environment: typeof environment;
		region: typeof region;
		releaseDate: typeof releaseDate;
		releaseVersion: typeof releaseVersion;
		cloudProvider: typeof cloudProvider;
		herokuAppId: typeof herokuAppId;
		herokuDynoId: typeof herokuDynoId;
		instanceId: typeof instanceId;
		semanticConventions: SemanticConventions;
	};

	export default appInfo;
	export = appInfo;
}
