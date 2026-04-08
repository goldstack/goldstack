import { GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { readFileSync } from 'fs';
import { createS3Client, resetMocks } from '../mockS3';

afterEach(() => {
  resetMocks();
});

test('Can store and retrieve binary image without corruption', async () => {
  const mockClient = createS3Client({
    localDirectory: 'goldstackLocal/s3',
    bucket: 'test-binary',
  });

  const imagePath = './src/__tests__/573402205-1ab7267b-49f9-4ae8-83e8-3425c6101062.jpg';
  const originalImageBuffer = readFileSync(imagePath);

  await mockClient.send(
    new PutObjectCommand({
      Bucket: 'test-binary',
      Key: 'test-image.jpg',
      Body: originalImageBuffer,
    }),
  );

  const res = await mockClient.send(
    new GetObjectCommand({
      Bucket: 'test-binary',
      Key: 'test-image.jpg',
    }),
  );

  const retrievedBytes = await res.Body?.transformToByteArray();
  const retrievedBuffer = Buffer.from(retrievedBytes!);

  expect(retrievedBuffer.length).toBe(originalImageBuffer.length);
  expect(retrievedBuffer).toEqual(originalImageBuffer);
});
