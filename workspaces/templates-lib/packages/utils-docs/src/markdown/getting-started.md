This is how an the S3 module can be used from another module:

```js
import { getBucketName, connect } from 'my-s3-module';

const s3 = connect();
await s3.putObject({
  BucketName: getBucketName(),
  Key: 'my-doc',
  Body: 'content',
});
```

The object returned from `connect()` is an instance of the [AWS S3 client](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html).
