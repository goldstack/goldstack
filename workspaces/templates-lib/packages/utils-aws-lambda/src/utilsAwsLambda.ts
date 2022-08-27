export { readLambdaConfig } from './generate/collectLambdasFromFiles';

export { generateFunctionName } from './generate/generateFunctionName';

export type { LambdaConfig } from './types/LambdaConfig';
export { RouteType } from './types/LambdaConfig';

export type {
  LambdaRoutesConfig,
  LambdaRouteConfig,
  LambdaApiDeploymentConfiguration,
  APIDomain,
  CorsHeader,
  HostedZoneDomain,
} from './types/LambdaDeploymentConfiguration';

export type { DeployFunctionParams } from './deployFunction';
export { deployFunction } from './deployFunction';

export type { DeployFunctionsParams } from './deployFunctions';
export { deployFunctions } from './deployFunctions';

export { defaultBuildOptions } from './defaultBuildOptions';

export {
  buildFunctions,
  getOutDirForLambda,
  getOutFileForLambda,
} from './buildFunctions';

export {
  generateLambdaConfig,
  validateDeployment,
} from './generateLambdaConfig';
