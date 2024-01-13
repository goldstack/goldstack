[![npm version](https://badge.fury.io/js/mock-aws-s3-v3.svg)](https://badge.fury.io/js/mock-aws-s3-v3)

# mock-aws-s3-v3

Local file-based mock for AWS S3 for unit and local testing for AWS JavaScript SDK v3+.

Based on [mock-aws-s3](https://www.npmjs.com/package/mock-aws-s3) and [aws-sdk-mock](https://www.npmjs.com/package/aws-sdk-mock).

## Usage

```typescript
import { createS3Client } from 'mock-aws-s3-v3';
import { GetObjectCommand } from '@aws-sdk/client-s3';

const client = createS3Client('./local-folder'); // of type S3Client

client.send(new GetObjectCommand({
  Bucket: 'test-bucket',
  Key: 'test-key',
});
```

This will create:

- Folder `./local-folder/test-bucket`
- File `./local-folder/test-key`