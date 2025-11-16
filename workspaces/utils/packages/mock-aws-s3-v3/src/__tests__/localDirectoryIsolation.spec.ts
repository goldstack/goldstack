import { GetObjectCommand, NoSuchKey, PutObjectCommand } from '@aws-sdk/client-s3';
import assert from 'assert';
import { createS3Client } from '../mockS3';

test('Clients with different local directories cannot access each others objects', async () => {
  const client1 = createS3Client({
    localDirectory: 'goldstackLocal/s3/dir1',
    bucket: 'test-local',
  });

  const client2 = createS3Client({
    localDirectory: 'goldstackLocal/s3/dir2',
    bucket: 'test-local-2',
  });

  // Client 1 puts an object
  await client1.send(
    new PutObjectCommand({
      Bucket: 'test-local',
      Key: 'test-object',
      Body: 'client1-data',
    }),
  );

  // Client 2 should not be able to see client1's object
  try {
    await client2.send(
      new GetObjectCommand({
        Bucket: 'test-local-2',
        Key: 'test-object',
      }),
    );
    assert(false, 'Should have thrown NoSuchKey error');
  } catch (e) {
    expect(e).toBeInstanceOf(NoSuchKey);
  }

  // Verify we can still get our own object
  const res = await client1.send(
    new GetObjectCommand({
      Bucket: 'test-local',
      Key: 'test-object',
    }),
  );
  assert((await res.Body?.transformToString()) === 'client1-data');
});
