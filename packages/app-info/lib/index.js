import gatherAppInfo from './gather-app-info.js';

const appInfo = gatherAppInfo({ env: process.env, rootPath: process.cwd() });

export const cloudProvider = appInfo.cloudProvider;
export const commitHash = appInfo.commitHash;
export const environment = appInfo.environment;
export const herokuAppId = appInfo.herokuAppId;
export const herokuDynoId = appInfo.herokuDynoId;
export const instanceId = appInfo.instanceId;
export const processType = appInfo.processType;
export const region = appInfo.region;
export const releaseDate = appInfo.releaseDate;
export const releaseVersion = appInfo.releaseVersion;
export const semanticConventions = appInfo.semanticConventions;
export const systemCode = appInfo.systemCode;

export default appInfo;
