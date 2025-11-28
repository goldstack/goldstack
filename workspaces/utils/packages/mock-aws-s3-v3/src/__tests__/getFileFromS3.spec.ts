import { GetObjectCommand, NoSuchKey, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { createS3Client } from 'mock-aws-s3-v3';

test('Can retrieve file using getFileFromS3 function if it exists', async () => {
  const client = createS3Client({
    localDirectory: 's3Mock',
    bucket: 'bucket',
  });

  // Put an object first so getFileFromS3 can retrieve it
  await client.send(
    new PutObjectCommand({
      Bucket: 'bucket',
      Key: 'some-file',
      Body: 'test content',
    }),
  );

  const response = await getFileFromS3('bucket', 'some-file', client);

  expect(await response.Body?.transformToString()).toBe('test content');

  async function getFileFromS3(bucket: string, key: string, s3Client: S3Client) {
    const response = await s3Client.send(
      new GetObjectCommand({
        Bucket: bucket,
        Key: key,
      }),
    );
    return response;
  }
});

test('Can retrieve file with empty content using getFileFromS3 function if it exists', async () => {
  const client = createS3Client({
    localDirectory: 's3Mock',
    bucket: 'bucket',
  });

  // Put an object first so getFileFromS3 can retrieve it
  await client.send(
    new PutObjectCommand({
      Bucket: 'bucket',
      Key: 'some-other-file',
      Body: '',
    }),
  );

  const response = await getFileFromS3('bucket', 'some-other-file', client);

  expect(await response.Body?.transformToString()).toBe('');

  async function getFileFromS3(bucket: string, key: string, s3Client: S3Client) {
    const response = await s3Client.send(
      new GetObjectCommand({
        Bucket: bucket,
        Key: key,
      }),
    );
    return response;
  }
});

test('Correct error when accessing not existing object', async () => {
  const client = createS3Client({
    localDirectory: 's3Mock',
    bucket: 'new-bucket',
  });

  await expect(getFileFromS3('bucket', 'some-key-that-does-not-exist', client)).rejects.toThrow(
    NoSuchKey,
  );

  async function getFileFromS3(bucket: string, key: string, s3Client: S3Client) {
    const response = await s3Client.send(
      new GetObjectCommand({
        Bucket: bucket,
        Key: key,
      }),
    );
    return response;
  }
});

test('Warns when accessing invalid bucket and falls back to real client', async () => {
  const client = createS3Client({
    localDirectory: 's3Mock',
    bucket: 'bucket',
  });

  const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

  await expect(getFileFromS3('invalid-bucket', 'some-file', client)).rejects.toThrow();

  expect(consoleWarnSpy).toHaveBeenCalledWith(
    "Bucket 'invalid-bucket' is not mocked. Falling back to real AWS S3 client. Only buckets created with createS3Client() can be accessed through this mock client.",
  );

  consoleWarnSpy.mockRestore();

  async function getFileFromS3(bucket: string, key: string, s3Client: S3Client) {
    const response = await s3Client.send(
      new GetObjectCommand({
        Bucket: bucket,
        Key: key,
      }),
    );
    return response;
  }
});
