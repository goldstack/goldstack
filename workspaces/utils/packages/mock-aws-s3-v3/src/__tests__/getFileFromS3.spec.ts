import { GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
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

  console.log(response);
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
