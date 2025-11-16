import {
  DeleteBucketCommand,
  DeleteObjectsCommand,
  ListObjectsV2Command,
  S3Client,
} from '@aws-sdk/client-s3';

const bucketsToDelete = [];

(async () => {
  const deleteAllObjectsFromBucket = async (s3: S3Client, bucketName: string): Promise<void> => {
    let continuationToken: string | undefined;
    do {
      // List objects in the bucket
      const listResponse = await s3.send(
        new ListObjectsV2Command({
          Bucket: bucketName,
          ContinuationToken: continuationToken,
        }),
      );

      // Check if there are any objects to delete
      if (listResponse.Contents && listResponse.Contents.length > 0) {
        // Delete listed objects
        const deleteParams = {
          Bucket: bucketName,
          Delete: {
            Objects: listResponse.Contents.map((object) => ({
              Key: object.Key,
            })),
          },
        };
        await s3.send(new DeleteObjectsCommand(deleteParams));
      }

      // Check if more objects are to be listed (pagination)
      continuationToken = listResponse.NextContinuationToken;
    } while (continuationToken);
  };

  const deleteS3Bucket = async (params: { s3: S3Client; bucketName: string }): Promise<void> => {
    try {
      // First, delete all objects from the bucket
      await deleteAllObjectsFromBucket(params.s3, params.bucketName);

      // Then, delete the empty bucket
      await params.s3.send(new DeleteBucketCommand({ Bucket: params.bucketName }));
    } catch (e) {
      throw e; // Rethrow the error to handle it in the calling code if necessary
    }
  };

  const s3 = new S3Client({
    region: 'us-west-2',
  });

  for (const bucketName of bucketsToDelete) {
    console.log(`deleting ${bucketName}`);
    await deleteAllObjectsFromBucket(s3, bucketName);
    await deleteS3Bucket({ s3, bucketName });
  }
})();
