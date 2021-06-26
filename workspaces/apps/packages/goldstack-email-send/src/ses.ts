import {
  connect as templateConnect,
  getMockedSES as templateGetMockedSES,
  getFromDomain as templateGetFromDomain,
  MockedSES,
} from '@goldstack/template-email-send';

import SES from 'aws-sdk/clients/ses';
import goldstackConfig from './../goldstack.json';
import goldstackSchema from './../schemas/package.schema.json';

export const connect = async (deploymentName?: string): Promise<SES> => {
  return await templateConnect(
    goldstackConfig,
    goldstackSchema,
    deploymentName
  );
};

export const getMockedSES = (): MockedSES => {
  return templateGetMockedSES();
};

export const getFromDomain = async (
  deploymentName?: string
): Promise<string> => {
  return templateGetFromDomain(
    goldstackConfig,
    goldstackSchema,
    deploymentName
  );
};
