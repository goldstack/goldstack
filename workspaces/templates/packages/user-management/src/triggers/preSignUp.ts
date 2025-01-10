// eslint-disable-next-line @typescript-eslint/no-var-requires
require('source-map-support').install();
import { PreSignUpTriggerHandler } from 'aws-lambda';

import { v7 } from 'uuid';

export const handler: PreSignUpTriggerHandler = async (event, context) => {
  const userData = {
    id: event.request.userAttributes.sub,
    email: event.request.userAttributes.email,
  };

  console.log('Pre Sign Up', userData);
  const userId = v7();

  // Assign the user ID to the custom attribute
  event.request.userAttributes['custom:app_user_id'] = userId;

  return event;
};
