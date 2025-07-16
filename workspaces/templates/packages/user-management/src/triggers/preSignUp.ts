require('source-map-support').install();

import type { PreSignUpTriggerHandler } from 'aws-lambda';

export const handler: PreSignUpTriggerHandler = async (event, context) => {
  const userData = {
    id: event.request.userAttributes.sub,
    email: event.request.userAttributes.email,
  };

  console.log('Pre Sign Up', userData);

  return event;
};
