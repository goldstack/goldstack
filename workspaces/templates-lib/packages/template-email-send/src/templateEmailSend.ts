import type {
  EmailSendPackage,
  EmailSendDeployment,
} from './types/EmailSendPackage';

export type { EmailSendDeployment, EmailSendPackage };

export { connect, getMockedSES, getFromDomain } from './sesConnect';
export { MockedSES } from './mockedSES';
