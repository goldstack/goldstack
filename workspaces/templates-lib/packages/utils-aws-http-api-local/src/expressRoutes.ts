import { type LambdaConfig, generateFunctionName } from '@goldstack/utils-aws-lambda';

import type express from 'express';

import type { Request, Response } from 'express';
import {
  convertToGatewayEvent,
  createContext,
  injectGatewayResultIntoResponse,
} from './expressRequestToHttpApiGatewayEvent';
export interface InjectRoutesParam {
  lambdaConfigs: LambdaConfig[];
  app: express.Application;
}

/*
Ensure more generic routes are handled later
*/
export const sortRoutesBySpecificity = (configs: LambdaConfig[]): LambdaConfig[] => {
  const res: LambdaConfig[] = [...configs];

  res.sort((first, second) => {
    if (first.path === '$default') {
      return 1;
    }
    if (second.path === '$default') {
      return -1;
    }
    if (first.route.indexOf('+}') !== -1 && second.route.indexOf('+}') === -1) {
      return 1;
    }
    if (second.route.indexOf('+}') !== -1 && first.route.indexOf('+}') === -1) {
      return -1;
    }
    if (first.route.indexOf('}') !== -1 && second.route.indexOf('}') === -1) {
      return 1;
    }
    if (second.route.indexOf('}') !== -1 && first.route.indexOf('}') === -1) {
      return -1;
    }

    // ensure longer routes come first
    return (
      second.route.replace(/\{(.*?)\}/g, '').length - first.route.replace(/\{(.*?)\}/g, '').length
    );
  });

  return res;
};

export const gatewayRouteToExpressPath = (route: string): string => {
  if (route === '$default') {
    return '*';
  }
  // see https://expressjs.com/en/guide/routing.html
  let path = route;
  // see https://stackoverflow.com/a/16829917/270662
  path = path.replace(/\{(.*?)\+\}/g, ':$1*');
  path = path.replace(/\{(.*?)\}/g, ':$1');
  return path;
};

export const injectRoutes = (params: InjectRoutesParam): void => {
  const sortedConfigs = sortRoutesBySpecificity(params.lambdaConfigs);
  for (const lambdaConfig of sortedConfigs) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const script = require(lambdaConfig.absoluteFilePath);
    const handler = script.handler;

    const expressPath = gatewayRouteToExpressPath(lambdaConfig.path);

    params.app.all(expressPath, async (req: Request, resp: Response): Promise<void> => {
      const functionName = generateFunctionName('local', lambdaConfig);
      process.env.GOLDSTACK_FUNCTION_NAME = functionName;
      process.env.GOLDSTACK_DEPLOYMENT = 'local';
      const result = await handler(
        convertToGatewayEvent({ req: req, lambdaConfig: lambdaConfig }),
        createContext({
          functionName,
        }),
      );
      injectGatewayResultIntoResponse(result, resp);
    });
  }
};
