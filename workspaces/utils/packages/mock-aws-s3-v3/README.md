[![npm version](https://badge.fury.io/js/mock-aws-s3-v3.svg)](https://badge.fury.io/js/mock-aws-s3-v3)

# Mock AWS S3 SDK v3

Local file-based mock for AWS S3 for unit and local testing for AWS JavaScript SDK v3+.

Based on [mock-aws-s3](https://www.npmjs.com/package/mock-aws-s3) and [aws-sdk-mock](https://www.npmjs.com/package/aws-sdk-mock).

## Usage

```typescript
import { createS3Client } from 'mock-aws-s3-v3';
import { GetObjectCommand } from '@aws-sdk/client-s3';

const client = createS3Client('./local-folder'); // of type S3Client

client.send(new PutObjectCommand({
  Bucket: 'test-bucket',
  Key: 'test-key',
  Body: 'hello',
});
```

This will create:

- Folder `./local-folder/test-bucket`
- File `./local-folder/test-key` with content 'hello'

## Supported Operations

The following operations are currently supported in this mock:

- CreateBucketCommand
- DeleteBucketCommand
- ListObjectsCommand
- ListObjectsV2Command
- DeleteObjectsCommand
- DeleteObjectCommand
- GetObjectCommand
- HeadObjectCommand
- PutObjectCommand
- CopyObjectCommand
- GetObjectTaggingCommand
- PutObjectTaggingCommand

Same as [mock-aws-s3](https://www.npmjs.com/package/mock-aws-s3) minus `getSignedUrl`. For an example of how `getSignedUrl` could be mocked, see [templateS3Bucket.ts](https://github.com/goldstack/goldstack/blob/5842322ed4f5165da56fc2ab899f11bd9e1821e3/workspaces/templates-lib/packages/template-s3/src/templateS3Bucket.ts#L64).