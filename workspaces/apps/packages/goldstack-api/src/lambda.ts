require('source-map-support').install();

import awsServerlessExpress from 'aws-serverless-express';
import { app } from './server';

const server = awsServerlessExpress.createServer(app);

exports.handler = (
  // biome-ignore lint/suspicious/noExplicitAny: AWS Lambda event and context types are complex and vary
  event: any,
  // biome-ignore lint/suspicious/noExplicitAny: AWS Lambda event and context types are complex and vary
  context: any,
): void => {
  awsServerlessExpress.proxy(server, event, context);
};