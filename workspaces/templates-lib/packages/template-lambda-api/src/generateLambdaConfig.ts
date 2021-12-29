import { LambdaConfig } from '@goldstack/utils-aws-lambda';
import {
  LambdaRoutesConfig,
  LambdaApiDeployment,
} from './types/LambdaApiPackage';

const santiseFunctionName = (input: string): string => {
  return input
    .replace(/\//g, '-')
    .replace(/\$/g, '_')
    .replace(/\{/g, '_')
    .replace(/\}/g, '_')
    .replace(/\+/g, '_')
    .replace(/[^\w\-_]/gi, '_');
};

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
  name = santiseFunctionName(name);

  let pathPrefix = '';
  const segments = config.path.split('/');
  if (segments.length > 2) {
    segments.shift(); // remove first element since path starts with '/' and thus the first element is always ''
    segments.pop(); // remove the last element since that is the name of the function in the route
    pathPrefix = santiseFunctionName(segments.join('-'));
    pathPrefix = `${pathPrefix}-`;
  }

  name = `${pathPrefix}${name}`;
  name = (`${deployment.configuration.lambdaNamePrefix}-` || '') + name;
  return name;
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
