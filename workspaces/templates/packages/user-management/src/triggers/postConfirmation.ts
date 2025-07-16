// eslint-disable-next-line @typescript-eslint/no-var-requires
require('source-map-support').install();
import { info } from '@goldstack/utils-log';
import type { PostConfirmationTriggerHandler } from 'aws-lambda';
import { generateUserId } from './generateUserId';

import {
  CognitoIdentityProviderClient,
  AdminUpdateUserAttributesCommand,
} from '@aws-sdk/client-cognito-identity-provider';

const cognitoClient = new CognitoIdentityProviderClient({});

export const handler: PostConfirmationTriggerHandler = async (
  event,
  context
) => {
  const userData = {
    id: event.request.userAttributes.sub,
    email: event.request.userAttributes.email,
  };

  // Only set the app_user_id if it doesn't already exist
  if (!event.request.userAttributes['custom:app_user_id']) {
    const userId = generateUserId();
    info('Setting custom attribute for ' + userData.email);

    await cognitoClient.send(
      new AdminUpdateUserAttributesCommand({
        UserPoolId: event.userPoolId,
        Username: event.userName,
        UserAttributes: [
          {
            Name: 'custom:app_user_id',
            Value: userId,
          },
        ],
      })
    );
  }

  console.log('Post confirmation', userData);

  return event;
};
