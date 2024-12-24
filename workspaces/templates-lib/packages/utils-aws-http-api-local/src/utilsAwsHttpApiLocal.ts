import express from 'express';
import cors from 'cors';
import { Server } from 'http';

import { readLambdaConfig, LambdaConfig } from '@goldstack/utils-aws-lambda';
import { injectRoutes } from './expressRoutes';

type StaticRouteOptions = {
  immutable: boolean;
  maxAge: number;
};

type StaticRoute = {
  path: string;
  options: StaticRouteOptions;
};

type StaticRoutes = {
  [key: string]: string | StaticRoute;
};

export interface LocalHttpAPIOptions {
  port: string;
  routesDir: string;
  cors?: string;
  /**
   * Maps routes to local directories
   */
  staticRoutes?: StaticRoutes;
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

  if (options.cors) {
    app.use(cors({ origin: options.cors, credentials: true }));
  }
  const lambdaConfig = readLambdaConfig(options.routesDir);

  // these should come before dynamic routes
  if (options.staticRoutes) {
    Object.entries(options.staticRoutes).forEach((e) => {
      if (typeof e[1] === 'string') {
        app.use(e[0], express.static(e[1]));
      } else {
        const routeInfo: StaticRoute = e[1];
        app.use(e[0], express.static(routeInfo.path, routeInfo.options));
      }
    });
  }

  const result = await new Promise<Server>((resolve) => {
    const server = app.listen(parseInt(options.port), function () {
      resolve(server);
    });
  });

  injectRoutes({
    app: app,
    lambdaConfigs: lambdaConfig,
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
