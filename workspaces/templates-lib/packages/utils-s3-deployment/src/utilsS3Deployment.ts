import { getAWSUser } from '@goldstack/infra-aws';
import { resolve } from 'path';
import { awsCli } from '@goldstack/utils-aws-cli';
import { logger } from '@goldstack/utils-cli';

export interface S3UploadParams {
  userName: string;
  region: string;
  localPath: string;
  bucket: string;
  bucketPath: string;
  skipDelete?: boolean;
  cacheControl?: string;
}

export const upload = async (params: S3UploadParams): Promise<void> => {
  const user = await getAWSUser(params.userName);

  const dest = `s3://${params.bucket}${params.bucketPath}`;
  const source = resolve(params.localPath);

  logger().info(
    {
      source,
      dest,
    },
    'Uploading to S3 using the AWS CLI'
  );

  // command run twice, once without and once with delete to ensure that
  // users will not try to request files that no longer exist
  // during the upload process
  // see https://github.com/aws/aws-cli/issues/1417
  const addHeader = params.cacheControl
    ? `--cache-control="${params.cacheControl}"`
    : '';
  await awsCli({
    command: `s3 sync ${addHeader} . ${dest}`,
    workDir: source,
    credentials: user,
    region: params.region,
    options: { silent: true },
  });
  if (!params.skipDelete) {
    await awsCli({
      command: `s3 sync . ${dest} --delete`,
      workDir: source,
      credentials: user,
      region: params.region,
      options: { silent: true },
    });
  }
};
