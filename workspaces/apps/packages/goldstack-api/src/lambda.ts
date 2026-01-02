require('source-map-support').install();

import awsServerlessExpress from 'aws-serverless-express';
import { app } from './server';

const server = awsServerlessExpress.createServer(app);

exports.handler = (event: any, context: any): void => {
  // biome-ignore lint/suspicious/noExplicitAny: AWS Lambda event and context types are complex and vary
  awsServerlessExpress.proxy(server, event, context);
};
