import type { SESClient, SendEmailRequest } from '@aws-sdk/client-ses';
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
export declare const connect: (deploymentName?: string) => Promise<SESClient>;
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
export declare const getSentEmailRequests: (client: SESClient) => SendEmailRequest[];
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
export declare const createSESClient: (client?: SESClient) => SESClient;
/**
 * Returns a mocked SES client instance for local development and testing.
 *
 * The mocked client records sent email requests and allows inspecting them via
 * `getSentEmailRequests`. It does not actually send emails.
 *
 * @returns {SESClient} A mocked SES client instance.
 */
export declare const getMockedSES: () => SESClient;
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
export declare const getFromDomain: (deploymentName?: string) => Promise<string>;
//# sourceMappingURL=ses.d.ts.map
