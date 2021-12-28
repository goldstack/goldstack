import { LambdaConfig } from '@goldstack/utils-aws-lambda';
import {
  LambdaRoutesConfig,
  LambdaApiDeployment,
} from './types/LambdaApiPackage';

function removeExtension(path: string): string {
  return path.replace(/\.[^/.]+$/, '');
}

/**
 * Generates a valid function name for a route
 */
export const generateFunctionName = (
  deployment: LambdaApiDeployment,
  config: LambdaConfig
): string => {
  let name = config.name;
  if (name === '$default') {
    // '$' is not a valid character in a lambda function name
    name = 'default_gateway_lambda_2281';
  }
  if (name === '$index') {
    name = 'index_root_lambda_4423';
  }
  name = `${removeExtension(config.relativePath)
    .replace(/\//g, '-')
    .replace(/\$/g, '_')}-${name}`;
  return (deployment.configuration.lambdaNamePrefix || '') + name;
};

export const generateLambdaConfig = (
  deployment: LambdaApiDeployment,
  config: LambdaConfig[]
): LambdaRoutesConfig => {
  return config.reduce((last, curr) => {
    last[curr.route] = {
      function_name: generateFunctionName(deployment, curr),
    };
    return last;
  }, {});
};
