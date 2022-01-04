import {
  LambdaConfig,
  generateFunctionName,
} from '@goldstack/utils-aws-lambda';
import { boolean } from 'yargs';
import {
  LambdaRoutesConfig,
  LambdaApiDeployment,
} from './types/LambdaApiPackage';

export const generateLambdaConfig = (
  deployment: LambdaApiDeployment,
  config: LambdaConfig[]
): LambdaRoutesConfig => {
  return config.reduce((last, curr) => {
    last[curr.route] = {
      function_name: generateFunctionName(
        deployment.configuration.lambdaNamePrefix,
        curr
      ),
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
