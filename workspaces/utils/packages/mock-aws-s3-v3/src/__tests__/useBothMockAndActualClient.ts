import { GetObjectCommand, NoSuchKey, S3Client } from '@aws-sdk/client-s3';
import { createS3Client, resetMocks } from '../mockS3';

test('use both actual and mock', async () => {
  const mockClient = createS3Client({
    localDirectory: 'goldstackLocal/s3',
    bucket: 'test-local',
  });
  try {
    await mockClient.send(
      new GetObjectCommand({
        Bucket: 'test-local',
        Key: 'iamcertainlynotthere',
      })
    );
  } catch (e) {
    if (e instanceof NoSuchKey) {
      // pass
    } else {
      throw e;
    }
  }

  resetMocks('test-local');

  expect(async () => {
    const realClient = new S3Client();
    await realClient.send(
      new GetObjectCommand({
        Bucket: 'doesntextist-22332',
        Key: 'alsodoesntexist',
      })
    );
  }).rejects.toThrowError();
});
