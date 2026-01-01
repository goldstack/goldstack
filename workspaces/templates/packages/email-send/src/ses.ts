import type { SESClient, SendEmailRequest } from '@aws-sdk/client-ses';
import {
  connect as templateConnect,
  createSESClient as templateCreateSESClient,
  getFromDomain as templateGetFromDomain,
  getMockedSES as templateGetMockedSES,
  getSentEmailRequests as templateGetSentEmailRequests,
} from '@goldstack/template-email-send';
import goldstackConfig from './../goldstack.json';
import goldstackSchema from './../schemas/package.schema.json';

/**
 * Connects to AWS SES (Simple Email Service) for a given deployment.
 *
 * This function establishes a connection to SES using the configuration specified in the
 * package's goldstack.json and schema. If no deployment name is provided, it will use
 * the value of the `GOLDSTACK_DEPLOYMENT` environment variable. For the 'local' deployment,
 * a mocked SES client is returned.
 *
 * @param {string} [deploymentName] - Optional name of the deployment to connect to.
 * @returns {Promise<SESClient>} A promise that resolves to an SES client instance.
 */
export const connect = async (deploymentName?: string): Promise<SESClient> => {
  return await templateConnect(goldstackConfig, goldstackSchema, deploymentName);
};

/**
 * Retrieves the list of email send requests that have been sent using a mocked SES client.
 *
 * This function accesses the internal sent requests stored in the mocked SES client
 * and returns them as an array of `SendEmailRequest` objects. It is only useful when
 * using a mocked SES client (e.g., in local development or tests).
 *
 * @param {SESClient} client - The mocked SES client instance.
 * @returns {SendEmailRequest[]} An array of email send requests that have been sent.
 */
export const getSentEmailRequests = (client: SESClient): SendEmailRequest[] => {
  return templateGetSentEmailRequests(client);
};

/**
 * Creates an SES (Simple Email Service) client.
 *
 * This function returns an SES client instance. If a client is provided as an argument,
 * it will be used; otherwise, a new client will be created. In non‑local environments
 * this will be a real AWS SES client, while in local development a mocked client is returned.
 *
 * @param {SESClient} [client] - An optional SES client instance to use.
 * @returns {SESClient} The SES client instance.
 */
export const createSESClient = (client?: SESClient): SESClient => {
  return templateCreateSESClient(client);
};

/**
 * Returns a mocked SES client instance for local development and testing.
 *
 * The mocked client records sent email requests and allows inspecting them via
 * `getSentEmailRequests`. It does not actually send emails.
 *
 * @returns {SESClient} A mocked SES client instance.
 */
export const getMockedSES = (): SESClient => {
  return templateGetMockedSES();
};

/**
 * Retrieves the domain configured for sending emails in a given deployment.
 *
 * This function reads the package configuration to determine the domain that will be used
 * as the `From` address for emails sent via SES. For the 'local' deployment, a test domain
 * is returned.
 *
 * @param {string} [deploymentName] - Optional name of the deployment.
 * @returns {Promise<string>} A promise that resolves to the domain string.
 */
export const getFromDomain = async (deploymentName?: string): Promise<string> => {
  return templateGetFromDomain(goldstackConfig, goldstackSchema, deploymentName);
};
