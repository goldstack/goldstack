import { GetObjectCommand, NoSuchKey, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { createS3Client } from '../mockS3';

test('use both actual and mock', async () => {
  const mockClient = createS3Client({
    localDirectory: 'goldstackLocal/s3',
    bucket: 'test-local',
  });
  await mockClient.send(
    new PutObjectCommand({
      Bucket: 'test-local',
      Key: 'test-key',
      Body: 'hello',
    }),
  );

  const res = await mockClient.send(
    new GetObjectCommand({
      Bucket: 'test-local',
      Key: 'test-key',
    }),
  );
  expect(await res.Body?.transformToString()).toBe('hello');

  // Should throw NoSuchKey when getting non-existent key from mocked bucket
  await expect(
    mockClient.send(
      new GetObjectCommand({
        Bucket: 'test-local',
        Key: 'non-existent-key',
      }),
    ),
  ).rejects.toThrow(NoSuchKey);

  // When using a non-mocked bucket through mock client, it should warn and fall back to real client
  await expect(
    mockClient.send(
      new GetObjectCommand({
        Bucket: 'test-local-not',
        Key: 'test-key',
      }),
    ),
  ).rejects.toThrow();

  // Direct use of real client should also throw
  const realClient = new S3Client();
  await expect(
    realClient.send(
      new GetObjectCommand({
        Bucket: 'test-remote-fake',
        Key: 'test-key',
      }),
    ),
  ).rejects.toThrow();
});
