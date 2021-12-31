import {
  LambdaConfig,
  generateFunctionName,
} from '@goldstack/utils-aws-lambda';
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
