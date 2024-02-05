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

	const appInfo = {
		systemCode: systemCode,
		processType: processType,
		commitHash: commitHash,
		environment: environment,
		region: region,
		releaseDate: releaseDate,
		releaseVersion: releaseVersion,
		cloudProvider: cloudProvider,
		herokuAppId: herokuAppId,
		herokuDynoId: herokuDynoId
	};

	export = {
		systemCode: systemCode,
		processType: processType,
		commitHash: commitHash,
		environment: environment,
		region: region,
		releaseDate: releaseDate,
		releaseVersion: releaseVersion,
		cloudProvider: cloudProvider,
		herokuAppId: herokuAppId,
		herokuDynoId: herokuDynoId
	};
}
