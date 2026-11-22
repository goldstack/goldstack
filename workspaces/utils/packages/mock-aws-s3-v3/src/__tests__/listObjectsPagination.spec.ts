import { ListObjectsV2Command, PutObjectCommand, type S3Client } from '@aws-sdk/client-s3';
import assert from 'assert';
import { rmSync } from 'fs';
import { createS3Client, resetMocks } from '../mockS3';

const localDirectory = 'goldstackLocal/s3-pagination';
const bucket = 'test-list-objects-pagination';

beforeAll(() => {
  rmSync(localDirectory, { recursive: true, force: true });
});

afterAll(() => {
  resetMocks();
  rmSync(localDirectory, { recursive: true, force: true });
});

async function putObjects(client: S3Client, count: number): Promise<void> {
  for (let i = 0; i < count; i++) {
    await client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: `file-${String(i).padStart(3, '0')}`,
        Body: 'content',
      }),
    );
  }
}

test('ListObjectsV2 returns a continuation token without a Delimiter', async () => {
  const mockClient = createS3Client({
    localDirectory,
    bucket,
  });
  await putObjects(mockClient, 25);

  const firstPage = await mockClient.send(
    new ListObjectsV2Command({
      Bucket: bucket,
      MaxKeys: 10,
    }),
  );

  assert.strictEqual(firstPage.Contents?.length, 10);
  assert.strictEqual(firstPage.IsTruncated, true);
  assert.ok(firstPage.NextContinuationToken);

  const secondPage = await mockClient.send(
    new ListObjectsV2Command({
      Bucket: bucket,
      MaxKeys: 10,
      ContinuationToken: firstPage.NextContinuationToken,
    }),
  );

  assert.strictEqual(secondPage.Contents?.length, 10);
  assert.strictEqual(secondPage.IsTruncated, true);
  assert.ok(secondPage.NextContinuationToken);
  assert.notStrictEqual(secondPage.NextContinuationToken, firstPage.NextContinuationToken);

  const thirdPage = await mockClient.send(
    new ListObjectsV2Command({
      Bucket: bucket,
      MaxKeys: 10,
      ContinuationToken: secondPage.NextContinuationToken,
    }),
  );

  assert.strictEqual(thirdPage.Contents?.length, 5);
  assert.strictEqual(thirdPage.IsTruncated, false);
  assert.strictEqual(thirdPage.NextContinuationToken, undefined);

  const keys = [
    ...(firstPage.Contents ?? []),
    ...(secondPage.Contents ?? []),
    ...(thirdPage.Contents ?? []),
  ].map((object) => object.Key);
  assert.strictEqual(new Set(keys).size, 25);
});
