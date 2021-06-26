import { getBucketName, connect } from './bucket';

describe('S3 Bucket', () => {
  it('Should get bucket name', async () => {
    const bucketName = await getBucketName('prod');
    expect(bucketName).toEqual('goldstack-test-s3-bucket');
  });

  it('Should be able to upload file', async () => {
    const s3 = await connect('prod');
    const bucketName = await getBucketName('prod');
    await s3
      .putObject({
        Key: 'test.txt',
        Body: 'hello',
        Bucket: bucketName,
      })
      .promise();
  });

  it('Should get local bucket name', async () => {
    const bucketName = await getBucketName();
    expect(bucketName).toEqual('local-s3');
  });

  it('Should connect to local bucket', async () => {
    const bucketName = await getBucketName();
    const s3 = await connect();
    await s3
      .putObject({
        Key: 'local.txt',
        Body: 'hello',
        Bucket: bucketName,
      })
      .promise();
  });
});
