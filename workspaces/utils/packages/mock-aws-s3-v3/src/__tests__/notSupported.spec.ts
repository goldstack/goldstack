import { ListBucketsCommand } from '@aws-sdk/client-s3';
import { createS3Client } from './../mockS3';

test('Provides error message for not implemented method.', async () => {
  try {
    const mockClient = createS3Client('goldstackLocal/s3');
    await mockClient.send(new ListBucketsCommand({}));
  } catch (e) {
    expect(e.message).toContain('not implemented');
  }
});
