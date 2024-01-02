import {
  AwsCredentialIdentityProvider,
  AwsCredentialIdentity,
} from '@aws-sdk/types';

import { STSClient, GetSessionTokenCommand } from '@aws-sdk/client-sts';

export async function getAWSCredentials(
  provider: AwsCredentialIdentityProvider
): Promise<AwsCredentialIdentity> {
  const client = new STSClient({ credentials: provider });
  const input = {
    DurationSeconds: 600,
  };
  const command = new GetSessionTokenCommand(input);
  const response = await client.send(command);

  if (!response.Credentials) {
    throw new Error('Cannot obtain AWS credentials.');
  }

  return {
    accessKeyId: response.Credentials.AccessKeyId || '',
    secretAccessKey: response.Credentials.SecretAccessKey || '',
    sessionToken: response.Credentials.SessionToken,
    expiration: response.Credentials.Expiration,
  };
}
