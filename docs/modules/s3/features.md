- S3 bucket defined in Terraform
- Supports definition for multiple environments (staging, production)
- Infrastructure easily stood up using an npm script `yarn infra up`
- Embed in server applications by linking to the package

```javascript
import { getBucketName, connect } from 'my-s3-module';

const s3 = connect();
await s3.putObject({
  BucketName: getBucketName(),
  Key: 'my-doc',
  Body: 'content',
});
```
