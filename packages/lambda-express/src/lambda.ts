// eslint-disable-next-line @typescript-eslint/no-var-requires
require('source-map-support').install();
import awsServerlessExpress from 'aws-serverless-express';
import { app } from './server';

const server = awsServerlessExpress.createServer(app);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
exports.handler = (event: any, context: any): any => {
  awsServerlessExpress.proxy(server, event, context);
};
