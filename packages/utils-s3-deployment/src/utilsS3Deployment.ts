import { getAWSUser } from '@goldstack/infra-aws';
import { resolve } from 'path';
import { awsCli } from '@goldstack/utils-aws-cli';

interface S3UploadParams {
  userName: string;
  region: string;
  localPath: string;
  bucket: string;
  bucketPath: string;
}

export const upload = async (params: S3UploadParams): Promise<void> => {
  const user = await getAWSUser(params.userName);
  awsCli({
    command: `s3 sync . s3://${params.bucket}${params.bucketPath}`,
    credentials: user,
    workDir: resolve(params.localPath),
    region: params.region,
  });
};
