import express from 'express';
import cors from 'cors';
import type { Server } from 'http';

import { readLambdaConfig, type LambdaConfig } from '@goldstack/utils-aws-lambda';
import { injectRoutes } from './expressRoutes';
import assert from 'assert';

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
  staticRoutes?: StaticRoutes;
  versionTimestamp?: {
    value: string;
    path: string;
  };
}

export interface StartServerResult {
  shutdown: () => Promise<void>;
  server: Server;
  lambdaConfig: LambdaConfig[];
}

export const startServer = async (options: LocalHttpAPIOptions): Promise<StartServerResult> => {
  const app: express.Application = express();
  app.use(express.json());

  if (options.cors) {
    app.use(cors({ origin: options.cors, credentials: true }));
  }
  const lambdaConfig = readLambdaConfig(options.routesDir);

  if (options.versionTimestamp) {
    app.get(options.versionTimestamp.path, (req, res) => {
      assert(options.versionTimestamp);
      res.send(options.versionTimestamp.value);
    });
  }

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
    const server = app.listen(parseInt(options.port), () => {
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
