import { ListObjectsCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import assert from 'assert';
import { createS3Client } from './../mockS3';

test('List objects', async () => {
  const mockClient = createS3Client('goldstackLocal/s3');
  await mockClient.send(
    new PutObjectCommand({
      Bucket: 'test-list-objects',
      Key: 'oneishere',
      Body: 'hithere',
    })
  );

  const res = await mockClient.send(
    new ListObjectsCommand({
      Bucket: 'test-list-objects',
    })
  );

  assert(res.Contents?.length === 1);
});

test('List objects V2', async () => {
  const mockClient = createS3Client('goldstackLocal/s3');
  await mockClient.send(
    new PutObjectCommand({
      Bucket: 'test-list-objects',
      Key: 'oneishere',
      Body: 'hithere',
    })
  );

  const res = await mockClient.send(
    new ListObjectsV2Command({
      Bucket: 'test-list-objects',
    })
  );

  assert(res.Contents?.length === 1);
});
