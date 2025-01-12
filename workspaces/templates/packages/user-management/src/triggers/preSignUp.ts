// eslint-disable-next-line @typescript-eslint/no-var-requires
require('source-map-support').install();
import { PreSignUpTriggerHandler } from 'aws-lambda';

export const handler: PreSignUpTriggerHandler = async (event, context) => {
  const userData = {
    id: event.request.userAttributes.sub,
    email: event.request.userAttributes.email,
  };

  console.log('Pre Sign Up', userData);

  return event;
};
