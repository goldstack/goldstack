import SES from 'aws-sdk/clients/ses';

import { v4 as uuid4 } from 'uuid';
import { AWSError, Request } from 'aws-sdk/lib/core';

export class MockedSES {
  private sendEmailRequests: SES.SendEmailRequest[];

  constructor() {
    this.sendEmailRequests = [];
  }

  getSentEmailRequests(): SES.SendEmailRequest[] {
    return this.sendEmailRequests;
  }

  sendEmail(
    params: SES.SendEmailRequest,
    callback?: any
  ): Request<SES.SendEmailResponse, AWSError> {
    this.sendEmailRequests.push(params);
    if (process.env.GOLDSTACK_LOG_EMAILS) {
      console.log('Send email');
      console.log(params);
    }
    if (callback) {
      callback(null, { MessageId: uuid4() });
      return {} as any;
    }
    return {
      promise: (): Promise<SES.SendEmailResponse> =>
        new Promise((resolve) => resolve({ MessageId: uuid4() })),
    } as any;
  }
}
