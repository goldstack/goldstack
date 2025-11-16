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

export const connect = async (deploymentName?: string): Promise<SESClient> => {
  return await templateConnect(goldstackConfig, goldstackSchema, deploymentName);
};

export const getSentEmailRequests = (client: SESClient): SendEmailRequest[] => {
  return templateGetSentEmailRequests(client);
};

export const createSESClient = (client?: SESClient): SESClient => {
  return templateCreateSESClient(client);
};

export const getMockedSES = (): SESClient => {
  return templateGetMockedSES();
};

export const getFromDomain = async (deploymentName?: string): Promise<string> => {
  return templateGetFromDomain(goldstackConfig, goldstackSchema, deploymentName);
};
