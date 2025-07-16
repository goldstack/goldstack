import type { EmailSendDeployment, EmailSendPackage } from './types/EmailSendPackage';

export type { EmailSendDeployment, EmailSendPackage };

export { connect, getFromDomain, getMockedSES } from './sesConnect';

import type { SESClient, SendEmailRequest } from '@aws-sdk/client-ses';
import { excludeInBundle } from '@goldstack/utils-esbuild';

// Import the CreateSESClientType type
import type { CreateSESClientType } from './mockedSES';

/**
 * Creates an SES (Simple Email Service) client.
 *
 * This function returns an SES client instance. If a client is provided as an argument,
 * it will be used; otherwise, a new client will be created using the mocked SES module.
 *
 * @param {SESClient} [sesClient] - An optional SES client instance to use.
 * @returns {SESClient} The SES client instance.
 */
export const createSESClient: CreateSESClientType = (sesClient) => {
  const createSESClient: CreateSESClientType = require(
    excludeInBundle('./mockedSES'),
  ).createSESClient;
  return createSESClient(sesClient);
};

/**
 * Retrieves the list of email send requests that have been sent using the provided SES client.
 *
 * This function accesses the internal `_goldstackSentRequests` property of the SES client
 * to return the list of email requests that have been sent.
 *
 * @param {SESClient} sesClient - The SES client instance from which to retrieve sent email requests.
 * @returns {SendEmailRequest[]} An array of `SendEmailRequest` objects representing the sent emails.
 */
export function getSentEmailRequests(sesClient: SESClient): SendEmailRequest[] {
  return (sesClient as any)._goldstackSentRequests;
}
