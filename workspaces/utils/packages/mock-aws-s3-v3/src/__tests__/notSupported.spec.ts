import { ListBucketsCommand } from '@aws-sdk/client-s3';
import { createS3Client } from '../mockS3';

test('Provides error message for not implemented method.', async () => {
  try {
    const mockClient = createS3Client({
      localDirectory: 'goldstackLocal/s3',
      bucket: 'test-bucket',
    });
    await mockClient.send(
      new ListBucketsCommand({
        Bucket: 'test-bucket',
      })
    );
  } catch (e) {
    expect(e.message).toContain('not implemented');
  }
});
