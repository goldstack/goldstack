import { GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { connect, getBucketName, getSignedUrl } from './bucket';

jest.setTimeout(60000);

describe('S3 Bucket', () => {
  it('Should get bucket name', async () => {
    const bucketName = await getBucketName('prod');
    expect(bucketName).toEqual('goldstack-test-s3-bucket');
  });

  it('Should be able to upload file', async () => {
    if (!process.env.AWS_ACCESS_KEY_ID) {
      console.warn('Testing of S3 upload skipped since no AWS credentials available');
      return;
    }
    const s3 = await connect('prod');
    const bucketName = await getBucketName('prod');
    const cmd = new PutObjectCommand({
      Key: 'test.txt',
      Body: 'hello',
      Bucket: bucketName,
    });
    await s3.send(cmd);
  });

  it('Should get local bucket name', async () => {
    const bucketName = await getBucketName();
    expect(bucketName).toEqual('local-s3');
  });

  it('Should connect to local bucket', async () => {
    const bucketName = await getBucketName();
    const s3 = await connect();
    const cmd = new PutObjectCommand({
      Key: 'local.txt',
      Body: 'hello',
      Bucket: bucketName,
    });
    await s3.send(cmd);
  });

  it('Should be able to mock signed url', async () => {
    const bucketName = await getBucketName();
    const s3 = await connect();
    const cmd = new GetObjectCommand({
      Key: 'test.txt',
      Bucket: bucketName,
    });
    const signedUrl = await getSignedUrl(s3, cmd);
    expect(signedUrl).toContain('localhost');
  });

  it('Should be able to get rel mock signed url', async () => {
    if (!process.env.AWS_ACCESS_KEY_ID) {
      console.warn('Testing of S3 upload skipped since no AWS credentials available');
      return;
    }
    const s3 = await connect('prod');
    const bucketName = await getBucketName('prod');

    const cmd = new GetObjectCommand({
      Key: 'test.txt',
      Bucket: bucketName,
    });
    const signedUrl = await getSignedUrl(s3, cmd);
    expect(signedUrl).not.toContain('localhost');
  });
});
