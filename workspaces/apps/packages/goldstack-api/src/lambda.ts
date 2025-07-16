require('source-map-support').install();

import awsServerlessExpress from 'aws-serverless-express';
import { app } from './server';

const server = awsServerlessExpress.createServer(app);

exports.handler = (event: any, context: any): any => {
  awsServerlessExpress.proxy(server, event, context);
};
