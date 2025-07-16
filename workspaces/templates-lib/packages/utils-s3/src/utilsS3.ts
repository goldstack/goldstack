import fs from 'fs';
import { type S3Client, NoSuchKey, GetObjectCommand } from '@aws-sdk/client-s3';

import type { NodeJsClient } from '@smithy/types';

/**
 * Downloads a file from S3 to a local file.
 */
export const download = async (params: {
  key: string;
  filePath: string;
  s3: S3Client;
  bucketName: string;
}): Promise<boolean> => {
  const filePath = params.filePath;
  return new Promise<boolean>(async (resolve, reject) => {
    const file = fs.createWriteStream(filePath);
    try {
      const cmd = new GetObjectCommand({
        Bucket: params.bucketName,
        Key: params.key,
      });

      const res = await (params.s3 as NodeJsClient<S3Client>).send(cmd);
      if (!res.Body) {
        throw new Error(
          'Cannot download from S3 bucket "' + params.bucketName + '".'
        );
      }
      res.Body?.pipe(file);
    } catch (e) {
      if (e instanceof NoSuchKey) {
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
