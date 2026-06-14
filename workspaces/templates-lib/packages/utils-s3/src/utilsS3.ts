import { GetObjectCommand, NoSuchKey, type S3Client } from '@aws-sdk/client-s3';
import type { NodeJsClient } from '@smithy/types';
import fs from 'fs';

const DOWNLOAD_TIMEOUT_MS = 30000;

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
  return new Promise<boolean>((resolve, reject) => {
    let settled = false;

    const cleanup = (): void => {
      if (settled) return;
      settled = true;
      try {
        fs.unlinkSync(filePath);
      } catch {
        // file may not exist
      }
    };

    const onSuccess = (): void => {
      settled = true;
      resolve(true);
    };

    const onFailure = (err: Error): void => {
      if (settled) return;
      settled = true;
      try {
        fs.unlinkSync(filePath);
      } catch {
        // file may not exist
      }
      reject(err);
    };

    const onNotFound = (): void => {
      if (settled) return;
      settled = true;
      resolve(false);
    };

    const timeout = setTimeout(() => {
      onFailure(
        new Error(
          `Download timed out after ${DOWNLOAD_TIMEOUT_MS}ms for key "${params.key}" in bucket "${params.bucketName}"`,
        ),
      );
    }, DOWNLOAD_TIMEOUT_MS);

    void (async () => {
      const file = fs.createWriteStream(filePath);
      try {
        const cmd = new GetObjectCommand({
          Bucket: params.bucketName,
          Key: params.key,
        });

        const res = await (params.s3 as NodeJsClient<S3Client>).send(cmd);
        if (!res.Body) {
          throw new Error(`Cannot download from S3 bucket "${params.bucketName}".`);
        }

        if (typeof (res.Body as { on?: unknown }).on === 'function') {
          (res.Body as NodeJS.ReadableStream).on('error', (e: Error) => {
            file.destroy();
            onFailure(new Error(`Error reading S3 object "${params.key}": ${e.message}`));
          });
        }

        file.on('finish', () => {
          clearTimeout(timeout);
          onSuccess();
        });
        file.on('error', (e: Error) => {
          clearTimeout(timeout);
          file.destroy();
          onFailure(new Error(`Error writing download file "${filePath}": ${e.message}`));
        });

        (res.Body as NodeJS.ReadableStream).pipe(file);
      } catch (e) {
        clearTimeout(timeout);
        file.destroy();
        if (e instanceof NoSuchKey) {
          onNotFound();
          return;
        }
        onFailure(e instanceof Error ? e : new Error(String(e)));
      }
    })();
  });
};
