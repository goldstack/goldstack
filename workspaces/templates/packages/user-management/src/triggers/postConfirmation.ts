// eslint-disable-next-line @typescript-eslint/no-var-requires
require('source-map-support').install();
import { PostConfirmationTriggerHandler } from 'aws-lambda';

export const handler: PostConfirmationTriggerHandler = async (
  event,
  context
) => {
  const userData = {
    id: event.request.userAttributes.sub,
    email: event.request.userAttributes.email,
  };

  console.log('Post confirmation', userData);

  return event;
};
