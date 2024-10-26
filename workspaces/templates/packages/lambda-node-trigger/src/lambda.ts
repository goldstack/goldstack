// eslint-disable-next-line @typescript-eslint/no-var-requires
require('source-map-support').install();

import { Handler } from 'aws-lambda';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const handler: Handler = async (event, context) => {
  console.log('doing work');
};
