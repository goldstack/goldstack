import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { NodeJsClient } from '@smithy/types';
import assert from 'assert';
import {
  createReadStream,
  createWriteStream,
  readFileSync,
  writeFileSync,
} from 'fs';
import { createS3Client } from './../mockS3';

test('Can store and retrieve text objects', async () => {
  const mockClient = createS3Client('goldstackLocal/s3');
  await mockClient.send(
    new PutObjectCommand({
      Bucket: 'test-local',
      Key: 'testobj',
      Body: 'hithere',
    })
  );

  await mockClient.send(
    new PutObjectCommand({
      Bucket: 'test-local',
      Key: 'dummy',
      Body: 'hithere2',
    })
  );

  const res = await mockClient.send(
    new GetObjectCommand({
      Bucket: 'test-local',
      Key: 'testobj',
    })
  );

  assert((await res.Body?.transformToString()) === 'hithere');

  const res2 = await mockClient.send(
    new GetObjectCommand({
      Bucket: 'test-local',
      Key: 'dummy',
    })
  );

  assert((await res2.Body?.transformToString()) === 'hithere2');
});

test('Can put and retrieve streams', async () => {
  const mockClient = createS3Client('goldstackLocal/s3');

  writeFileSync('./goldstackLocal/file.txt', 'streamedfile');

  const fileStream = createReadStream('./goldstackLocal/file.txt');

  await mockClient.send(
    new PutObjectCommand({
      Bucket: 'test-local',
      Key: 'teststreamobject',
      Body: fileStream,
    })
  );

  const res = await (mockClient as NodeJsClient<S3Client>).send(
    new GetObjectCommand({
      Bucket: 'test-local',
      Key: 'teststreamobject',
    })
  );

  const file = createWriteStream('./goldstackLocal/text.txt');

  const op = res.Body?.pipe(file);

  await new Promise<void>((resolve) => {
    op?.on('finish', () => {
      resolve();
    });
  });

  const checkFile = readFileSync('./goldstackLocal/text.txt').toString();
  assert(checkFile === 'streamedfile');
});
