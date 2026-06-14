import { createS3Client, resetMocks } from 'mock-aws-s3-v3';

import { PutObjectCommand } from '@aws-sdk/client-s3';
import { readFileSync } from 'fs';
import { download } from './utilsS3';

afterAll(() => {
  resetMocks();
});

test('Should download file', async () => {
  const client = createS3Client({
    localDirectory: './goldstackLocal/s3',
    bucket: 'test-download',
  });

  const putCmd = new PutObjectCommand({
    Bucket: 'test-download',
    Key: 'the-object',
    Body: 'hithere',
  });
  await client.send(putCmd);

  await download({
    bucketName: 'test-download',
    key: 'the-object',
    s3: client,
    filePath: './goldstackLocal/download.txt',
  });

  expect(readFileSync('./goldstackLocal/download.txt').toString()).toEqual('hithere');
});
