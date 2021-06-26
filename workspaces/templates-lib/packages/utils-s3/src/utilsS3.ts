import fs from 'fs';
import S3 from 'aws-sdk/clients/s3';
import { AWSError } from 'aws-sdk/lib/core';

/**
 * Downloads a file from S3 to a local file.
 */
export const download = async (params: {
  key: string;
  filePath: string;
  s3: S3;
  bucketName: string;
}): Promise<boolean> => {
  const filePath = params.filePath;
  return new Promise<boolean>((resolve, reject) => {
    const file = fs.createWriteStream(filePath);
    try {
      params.s3
        .getObject({
          Bucket: params.bucketName,
          Key: params.key,
        })
        .createReadStream()
        .pipe(file);
    } catch (e) {
      const awsError = e as AWSError;
      if (awsError.code === 'NoSuchKey') {
        resolve(false);
        return;
      }
      reject(e);
      return;
    }

    file.on('finish', () => {
      resolve(true);
    });
    file.on('error', (e) => {
      reject(e);
    });
  });
};
