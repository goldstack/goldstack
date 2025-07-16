import type { AWSAccessKeyId, AWSSecretAccessKey } from '@goldstack/infra-aws';

export interface AWSUserFormType {
  awsAccessKeyId?: AWSAccessKeyId;
  awsSecretAccessKey?: AWSSecretAccessKey;
}
