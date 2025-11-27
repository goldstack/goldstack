import {
  CopyObjectCommand,
  GetObjectCommand,
  GetObjectTaggingCommand,
  HeadObjectCommand,
  NoSuchKey,
  PutObjectCommand,
  PutObjectTaggingCommand,
  type S3Client,
} from '@aws-sdk/client-s3';
import type { NodeJsClient } from '@smithy/types';
import assert from 'assert';
import { createReadStream, createWriteStream, readFileSync, writeFileSync } from 'fs';
import { createS3Client } from '../mockS3';

test('Returns objects that do not exist as undefined', async () => {
  const mockClient = createS3Client({
    localDirectory: 'goldstackLocal/s3',
    bucket: 'test-local',
  });
  try {
    await mockClient.send(
      new GetObjectCommand({
        Bucket: 'test-local',
        Key: 'iamcertainlynotthere',
      }),
    );
  } catch (e) {
    if (e instanceof NoSuchKey) {
      // pass
    } else {
      throw e;
    }
  }
});

test('Throws NoSuchKey for HeadObjectCommand on non-existent objects', async () => {
  const mockClient = createS3Client({
    localDirectory: 'goldstackLocal/s3',
    bucket: 'test-local',
  });
  let expectedErrorThrown = false;
  try {
    await mockClient.send(
      new HeadObjectCommand({
        Bucket: 'test-local',
        Key: 'iamcertainlynotthere',
      }),
    );
    throw new Error('Expected HeadObjectCommand to throw NoSuchKey');
  } catch (e) {
    if (e instanceof NoSuchKey) {
      // pass - this is the expected behavior
      expectedErrorThrown = true;
    } else {
      throw e;
    }
  }
  expect(expectedErrorThrown).toBeTruthy();
});

test('Throws NoSuchKey for GetObjectTaggingCommand on non-existent objects', async () => {
  const mockClient = createS3Client({
    localDirectory: 'goldstackLocal/s3',
    bucket: 'test-local',
  });
  try {
    await mockClient.send(
      new GetObjectTaggingCommand({
        Bucket: 'test-local',
        Key: 'iamcertainlynotthere',
      }),
    );
    throw new Error('Expected GetObjectTaggingCommand to throw NoSuchKey');
  } catch (e) {
    if (e instanceof NoSuchKey) {
      // pass - this is the expected behavior
    } else {
      throw e;
    }
  }
});

test('Throws NoSuchKey for PutObjectTaggingCommand on non-existent objects', async () => {
  const mockClient = createS3Client({
    localDirectory: 'goldstackLocal/s3',
    bucket: 'test-local',
  });
  try {
    await mockClient.send(
      new PutObjectTaggingCommand({
        Bucket: 'test-local',
        Key: 'iamcertainlynotthere',
        Tagging: {
          TagSet: [{ Key: 'test', Value: 'value' }],
        },
      }),
    );
    throw new Error('Expected PutObjectTaggingCommand to throw NoSuchKey');
  } catch (e) {
    if (e instanceof NoSuchKey) {
      // pass - this is the expected behavior
    } else {
      throw e;
    }
  }
});

test('Throws NoSuchKey for CopyObjectCommand with non-existent source', async () => {
  const mockClient = createS3Client({
    localDirectory: 'goldstackLocal/s3',
    bucket: 'test-local',
  });
  try {
    await mockClient.send(
      new CopyObjectCommand({
        Bucket: 'test-local',
        Key: 'destination',
        CopySource: 'test-local/iamcertainlynotthere',
      }),
    );
    throw new Error('Expected CopyObjectCommand to throw NoSuchKey');
  } catch (e) {
    if (e instanceof NoSuchKey) {
      // pass - this is the expected behavior
    } else {
      throw e;
    }
  }
});

test('Can store and retrieve text objects', async () => {
  const mockClient = createS3Client({
    localDirectory: 'goldstackLocal/s3',
    bucket: 'test-local',
  });
  await mockClient.send(
    new PutObjectCommand({
      Bucket: 'test-local',
      Key: 'testobj',
      Body: 'hithere',
    }),
  );

  await mockClient.send(
    new PutObjectCommand({
      Bucket: 'test-local',
      Key: 'dummy',
      Body: 'hithere2',
    }),
  );

  const res = await mockClient.send(
    new GetObjectCommand({
      Bucket: 'test-local',
      Key: 'testobj',
    }),
  );

  assert((await res.Body?.transformToString()) === 'hithere');

  const res2 = await mockClient.send(
    new GetObjectCommand({
      Bucket: 'test-local',
      Key: 'dummy',
    }),
  );

  assert((await res2.Body?.transformToString()) === 'hithere2');
});

test('Can put and retrieve streams', async () => {
  const mockClient = createS3Client({
    localDirectory: 'goldstackLocal/s3',
    bucket: 'test-local',
  });

  writeFileSync('./goldstackLocal/file.txt', 'streamedfile');

  const fileStream = createReadStream('./goldstackLocal/file.txt');

  await mockClient.send(
    new PutObjectCommand({
      Bucket: 'test-local',
      Key: 'teststreamobject',
      Body: fileStream,
    }),
  );

  const res = await (mockClient as NodeJsClient<S3Client>).send(
    new GetObjectCommand({
      Bucket: 'test-local',
      Key: 'teststreamobject',
    }),
  );

  const file = createWriteStream('./goldstackLocal/text.txt');

  const op = res.Body?.pipe(file);

  await new Promise<void>((resolve) => {
    op?.on('finish', () => {
      resolve();
    });
  });

  const checkFile = readFileSync('./goldstackLocal/text.txt').toString('utf8');
  assert(checkFile === 'streamedfile');
});
