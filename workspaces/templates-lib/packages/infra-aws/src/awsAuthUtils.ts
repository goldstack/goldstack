import type {
  AwsCredentialIdentityProvider,
  AwsCredentialIdentity,
} from '@aws-sdk/types';

import { STSClient, GetSessionTokenCommand } from '@aws-sdk/client-sts';

export function injectCredentials(
  provider: AwsCredentialIdentityProvider,
  credentials: AwsCredentialIdentity
): void {
  (provider as any)._injectedCredentials = credentials;
}

export function hasInjectedCredentials(
  provider: AwsCredentialIdentityProvider
): boolean {
  return (provider as any)._injectedCredentials != undefined;
}

export function retrieveInjectedCredentials(
  provider: AwsCredentialIdentityProvider
): AwsCredentialIdentity {
  return (provider as any)._injectedCredentials as AwsCredentialIdentity;
}

export async function getAWSCredentials(
  provider: AwsCredentialIdentityProvider
): Promise<AwsCredentialIdentity> {
  if (hasInjectedCredentials(provider)) {
    return retrieveInjectedCredentials(provider);
  }

  const client = new STSClient({ credentials: provider });
  const input = {
    DurationSeconds: 900,
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
