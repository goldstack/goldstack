import { info } from '@goldstack/utils-log';
import { stopAllLocalDynamoDB } from './../src/table';

export default async () => {
  info('Jest global teardown: Stopping all left over local DynamoDB instances.');
  await stopAllLocalDynamoDB();
};
