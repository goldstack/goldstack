import { GetObjectCommand, NoSuchKey, type S3Client } from '@aws-sdk/client-s3';
import type { NodeJsClient } from '@smithy/types';
import fs from 'fs';
import { debug } from '@goldstack/utils-log';

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
  debug(`Download starting: bucket=${params.bucketName}, key=${params.key}, filePath=${filePath}`);
  return new Promise<boolean>((resolve, reject) => {
    let settled = false;

    const onSuccess = (): void => {
      debug(`Download succeeded: bucket=${params.bucketName}, key=${params.key}`);
      settled = true;
      resolve(true);
    };

    const onFailure = (err: Error): void => {
      if (settled) return;
      debug(
        `Download failed: bucket=${params.bucketName}, key=${params.key}, error=${err.message}`,
      );
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
      debug(`Download not found: bucket=${params.bucketName}, key=${params.key}`);
      settled = true;
      resolve(false);
    };

    void (async () => {
      const file = fs.createWriteStream(filePath);
      try {
        const cmd = new GetObjectCommand({
          Bucket: params.bucketName,
          Key: params.key,
        });

        debug(`Sending GetObjectCommand: bucket=${params.bucketName}, key=${params.key}`);
        const res = await (params.s3 as NodeJsClient<S3Client>).send(cmd);
        debug(
          `GetObjectCommand response received: bucket=${params.bucketName}, key=${params.key}, hasBody=${!!res.Body}`,
        );
        if (!res.Body) {
          throw new Error(`Cannot download from S3 bucket "${params.bucketName}".`);
        }

        const bodyHasOn = typeof (res.Body as { on?: unknown }).on === 'function';
        debug(
          `Body stream check: hasOnMethod=${bodyHasOn}, bucket=${params.bucketName}, key=${params.key}`,
        );

        if (bodyHasOn) {
          (res.Body as NodeJS.ReadableStream).on('error', (e: Error) => {
            debug(
              `Body stream error: bucket=${params.bucketName}, key=${params.key}, error=${e.message}`,
            );
            file.destroy();
            onFailure(new Error(`Error reading S3 object "${params.key}": ${e.message}`));
          });
        }

        file.on('finish', () => {
          debug(
            `Write stream finish: bucket=${params.bucketName}, key=${params.key}, filePath=${filePath}`,
          );
          onSuccess();
        });
        file.on('error', (e: Error) => {
          debug(
            `Write stream error: bucket=${params.bucketName}, key=${params.key}, error=${e.message}`,
          );
          file.destroy();
          onFailure(new Error(`Error writing download file "${filePath}": ${e.message}`));
        });

        debug(`Piping body to file: bucket=${params.bucketName}, key=${params.key}`);
        (res.Body as NodeJS.ReadableStream).pipe(file);
        debug(`Pipe set up complete: bucket=${params.bucketName}, key=${params.key}`);
      } catch (e) {
        debug(
          `Download exception: bucket=${params.bucketName}, key=${params.key}, error=${e instanceof Error ? e.message : String(e)}`,
        );
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
