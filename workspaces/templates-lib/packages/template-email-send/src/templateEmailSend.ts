import type {
  EmailSendPackage,
  EmailSendDeployment,
} from './types/EmailSendPackage';

export type { EmailSendDeployment, EmailSendPackage };

export { connect, getMockedSES, getFromDomain } from './sesConnect';

import { SendEmailRequest, SESClient } from '@aws-sdk/client-ses';
import { excludeInBundle } from '@goldstack/utils-esbuild';

export function createSESClient(sesClient?: SESClient): SESClient {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  return require(excludeInBundle('./mockedSES')).createSESClient(sesClient);
}

export function getSentEmailRequests(sesClient: SESClient): SendEmailRequest[] {
  return (sesClient as any)._goldstackSentRequests;
}
