import express from 'express';
import { Server } from 'http';

import { readLambdaConfig, LambdaConfig } from '@goldstack/utils-aws-lambda';
import { injectRoutes } from './expressRoutes';

export interface LocalHttpAPIOptions {
  port: string;
  routesDir: string;
}

export interface StartServerResult {
  shutdown: () => Promise<void>;
  server: Server;
  lambdaConfig: LambdaConfig[];
}

export const startServer = async (
  options: LocalHttpAPIOptions
): Promise<StartServerResult> => {
  const app: express.Application = express();
  app.use(express.json());

  const lambdaConfig = readLambdaConfig(options.routesDir);

  injectRoutes({
    app: app,
    lambdaConfigs: lambdaConfig,
  });

  const result = await new Promise<Server>((resolve) => {
    const server = app.listen(parseInt(options.port), function () {
      console.log(`Server is listening on port ${options.port}!`);
      console.log(`http://localhost:${options.port}/`);
      resolve(server);
    });
  });

  return {
    server: result,
    lambdaConfig: lambdaConfig,
    shutdown: (): Promise<void> => {
      return new Promise<void>((resolve, reject) => {
        result.close((err) => {
          if (err) {
            reject(err);
            return;
          }
          resolve();
        });
      });
    },
  };
};
