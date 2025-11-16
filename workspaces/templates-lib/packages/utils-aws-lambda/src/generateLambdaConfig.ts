import { generateFunctionName, type LambdaConfig } from '@goldstack/utils-aws-lambda';
import type {
  LambdaApiDeploymentConfiguration,
  LambdaRoutesConfig,
} from './types/LambdaDeploymentConfiguration';

export const generateLambdaConfig = (
  configuration: LambdaApiDeploymentConfiguration,
  config: LambdaConfig[],
): LambdaRoutesConfig => {
  return config.reduce((last, curr) => {
    let id = curr.route;
    if (id === '$default') {
      id = 'default';
    }
    last[`${id}`] = {
      function_name: generateFunctionName(configuration.lambdaNamePrefix, curr),
      route: curr.route,
    };
    return last;
  }, {});
};

export const validateDeployment = (config: LambdaRoutesConfig): boolean => {
  let valid = true;
  for (const e of Object.entries(config)) {
    valid = valid && e[0].length > 0;
    valid = valid && !!e[1].function_name && e[1].function_name.length > 0;
  }
  return valid;
};
