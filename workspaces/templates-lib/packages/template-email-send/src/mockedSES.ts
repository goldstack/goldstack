import {
  SESClient,
  SendEmailRequest,
  SendEmailResponse,
  SendEmailCommand,
} from '@aws-sdk/client-ses';

import { mockClient } from 'aws-sdk-client-mock';
import { v4 as uuid4 } from 'uuid';

export function createSESClient(sesClient?: SESClient): SESClient {
  if (!sesClient) {
    sesClient = new SESClient();
  }
  const mockedClient = mockClient(sesClient);

  const sendEmailRequests: SendEmailRequest[] = [];

  (sesClient as any)._goldstackSentRequests = sendEmailRequests;
  mockedClient.on(SendEmailCommand).callsFake(async (input): Promise<any> => {
    if (process.env.GOLDSTACK_LOG_EMAILS) {
      console.log('Mocked SES Send email');
      console.log(JSON.stringify(input, null, 2));
    }
    sendEmailRequests.push(input);
    return {
      MessageId: uuid4(),
    };
  });

  return sesClient;
}

export function getSentEmailRequests(sesClient: SESClient): SendEmailRequest[] {
  return (sesClient as any)._goldstackSentRequests;
}
