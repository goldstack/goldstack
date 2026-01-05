import { GetSessionTokenCommand, STSClient } from '@aws-sdk/client-sts';
import type { AwsCredentialIdentity, AwsCredentialIdentityProvider } from '@aws-sdk/types';

export function injectCredentials(
  provider: AwsCredentialIdentityProvider,
  credentials: AwsCredentialIdentity,
): void {
  // biome-ignore lint/suspicious/noExplicitAny: Accessing private property for credential injection
  (provider as any)._injectedCredentials = credentials;
}

export function hasInjectedCredentials(provider: AwsCredentialIdentityProvider): boolean {
  // biome-ignore lint/suspicious/noExplicitAny: Accessing private property for credential injection
  return (provider as any)._injectedCredentials !== undefined;
}

export function retrieveInjectedCredentials(
  provider: AwsCredentialIdentityProvider,
): AwsCredentialIdentity {
  // biome-ignore lint/suspicious/noExplicitAny: Accessing private property for credential injection
  return (provider as any)._injectedCredentials as AwsCredentialIdentity;
}

export async function getAWSCredentials(
  provider: AwsCredentialIdentityProvider,
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
