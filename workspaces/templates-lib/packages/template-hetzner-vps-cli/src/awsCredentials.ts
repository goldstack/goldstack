import {
  IAMClient,
  CreateUserCommand,
  CreateAccessKeyCommand,
  AttachUserPolicyCommand,
  GetUserCommand,
  DeleteUserCommand,
  DeleteAccessKeyCommand,
  ListAccessKeysCommand,
  DetachUserPolicyCommand,
  CreatePolicyCommand,
  ListAttachedUserPoliciesCommand,
  DeletePolicyCommand,
} from '@aws-sdk/client-iam';
import { getAWSUser, getAWSCredentials } from '@goldstack/infra-aws';
import { HetznerVPSDeployment } from '@goldstack/template-hetzner-vps';
import { logger } from '@goldstack/utils-cli';
import { mkdir, write } from '@goldstack/utils-sh';

import crypto from 'crypto';
import { existsSync } from 'fs';

async function checkIfUserExists(iamClient: IAMClient, userName: string) {
  try {
    const getUserCommand = new GetUserCommand({ UserName: userName });
    await iamClient.send(getUserCommand);
    return true;
  } catch (error) {
    if (error.name === 'NoSuchEntityException') {
      return false;
    }
    throw error;
  }
}

async function createUser(iamClient: IAMClient, userName: string) {
  logger().info(`Creating user ${userName}...`);
  const createUserCommand = new CreateUserCommand({ UserName: userName });
  const createUserResponse = await iamClient.send(createUserCommand);
  if (!createUserResponse.User) {
    throw new Error('User could not be created.');
  }
  logger().info(`User ${userName} created.`);
}

async function createAccessKey(iamClient: IAMClient, userName: string) {
  logger().info(`Creating access key for user ${userName}...`);
  const createAccessKeyCommand = new CreateAccessKeyCommand({
    UserName: userName,
  });
  const createAccessKeyResponse = await iamClient.send(createAccessKeyCommand);
  if (!createAccessKeyResponse.AccessKey) {
    throw new Error('Cannot create new access key for user.');
  }
  logger().info(`Access key created for user ${userName}.`);
  return {
    accessKeyId: createAccessKeyResponse.AccessKey.AccessKeyId,
    secretAccessKey: createAccessKeyResponse.AccessKey.SecretAccessKey,
  };
}

async function attachPolicyToUser(
  iamClient: IAMClient,
  userName: string,
  bucketName: string
) {
  logger().info(
    `Attaching policy to user ${userName} for bucket ${bucketName}...`
  );

  const policy = {
    Version: '2012-10-17',
    Statement: [
      {
        Effect: 'Allow',
        Action: ['s3:ListBucket', 's3:GetObject'],
        Resource: [
          `arn:aws:s3:::${bucketName}`,
          `arn:aws:s3:::${bucketName}/*`,
        ],
      },
    ],
  };

  const createPolicyCommand = new CreatePolicyCommand({
    PolicyName: `bucket-access-${bucketName}-${userName}`,
    PolicyDocument: JSON.stringify(policy),
  });

  const createPolicyResponse = await iamClient.send(createPolicyCommand);
  logger().info(
    'Policy created successfully:',
    createPolicyResponse.Policy?.Arn
  );

  const attachPolicyCommand = new AttachUserPolicyCommand({
    PolicyArn: createPolicyResponse.Policy?.Arn,
    UserName: userName,
  });

  await iamClient.send(attachPolicyCommand);

  logger().info(`Policy attached to user ${userName}.`);
}

export async function assertAWSCredentials(params: {
  deployment: HetznerVPSDeployment;
}): Promise<void> {
  if (existsSync('./dist/credentials/credentials')) {
    return;
  }

  logger().info(
    'AWS credentials for deployment access not found. Creating deleting all existing access keys and creating new access key.'
  );

  const { deployment } = params;
  const userName = deployment.configuration.vpsIAMUserName;
  if (!userName) {
    throw new Error(`IAM user name for bucket access not defined ${userName}`);
  }
  const awsUser = await getAWSUser(deployment.awsUser);
  const credentials = await getAWSCredentials(awsUser);

  const iamClient = new IAMClient({
    credentials: credentials,
    region: deployment.awsRegion,
  });

  // before creating our new access key, we first delete all existing ones
  await deleteAllAccessKeys(userName, iamClient);

  const accessKeys = await createAccessKey(iamClient, userName);

  logger().info(`Access key created: ${accessKeys.accessKeyId}`);

  const vpsCredentials = {
    ...accessKeys,
    awsRegion: deployment.awsRegion,
  };

  mkdir('-p', './dist/credentials');
  write(
    JSON.stringify(vpsCredentials, null, 2),
    './dist/credentials/credentials'
  );
}

export async function assertUserWithReadOnlyS3Access(params: {
  deployment: HetznerVPSDeployment;
  bucketName: string;
}): Promise<void> {
  if (!params.deployment.configuration.vpsIAMUserName) {
    const userHash = crypto.randomBytes(6).toString('hex');
    params.deployment.configuration.vpsIAMUserName = `vps-${params.deployment.name}-${params.deployment.configuration.serverName}-${userHash}`;
    logger().info(
      'No AWS IAM user name defined for deployments bucket access. Generated user name',
      {
        userName: params.deployment.configuration.vpsIAMUserName,
      }
    );
  }

  const userName = params.deployment.configuration.vpsIAMUserName;
  const { bucketName, deployment } = params;
  const awsUser = await getAWSUser(deployment.awsUser);
  const credentials = await getAWSCredentials(awsUser);

  const iamClient = new IAMClient({
    credentials: credentials,
    region: deployment.awsRegion,
  });

  try {
    const userExists = await checkIfUserExists(iamClient, userName);

    if (!userExists) {
      logger().info(
        'AWS IAM user for deployment bucket access does not exist. Creating user.',
        { userName }
      );
      await createUser(iamClient, userName);
      await attachPolicyToUser(iamClient, userName, bucketName);
      logger().info('AWS IAM user created.');
    }
  } catch (error) {
    logger().error(`Error creating user or attaching policy: ${error.message}`);
    throw new Error(
      `Error creating user or attaching policy: ${error.message}`
    );
  }

  logger().info(`IAM user used for deployments via S3 bucket: ${userName}`);
}

export async function deleteUserAndResources(params: {
  deployment: HetznerVPSDeployment;
  vpsUserName: string;
}) {
  const userName = params.vpsUserName;
  const awsUser = await getAWSUser(params.deployment.awsUser);
  const credentials = await getAWSCredentials(awsUser);

  const iamClient = new IAMClient({
    credentials: credentials,
    region: params.deployment.awsRegion,
  });

  logger().info(`Deleting user ${userName} and all associated resources.`);

  try {
    // Step 1: List and delete all access keys for the user
    logger().info('Deleting access keys');
    await deleteAllAccessKeys(userName, iamClient);

    // Step 2: List and detach all policies attached to the user
    const listAttachedUserPoliciesCommand = new ListAttachedUserPoliciesCommand(
      {
        UserName: userName,
      }
    );
    const listAttachedUserPoliciesResponse = await iamClient.send(
      listAttachedUserPoliciesCommand
    );

    if (!listAttachedUserPoliciesResponse.AttachedPolicies) {
      throw new Error('Cannot read attached policies');
    }

    for (const policy of listAttachedUserPoliciesResponse.AttachedPolicies) {
      const detachUserPolicyCommand = new DetachUserPolicyCommand({
        UserName: userName,
        PolicyArn: policy.PolicyArn,
      });
      await iamClient.send(detachUserPolicyCommand);

      if (!policy.PolicyName) {
        throw new Error(
          'Could not load policy for detaching it ' + policy.PolicyName
        );
      }

      // Step 3: Delete the policy if it was created by the create function
      if (policy.PolicyName.startsWith('bucket-access-')) {
        logger().info(`Deleting policy ${policy.PolicyName}`);
        const deletePolicyCommand = new DeletePolicyCommand({
          PolicyArn: policy.PolicyArn,
        });
        await iamClient.send(deletePolicyCommand);
      }
    }

    // Step 4: Delete the user
    const deleteUserCommand = new DeleteUserCommand({ UserName: userName });
    logger().info('Deleting user');
    await iamClient.send(deleteUserCommand);

    logger().info(
      `User ${userName} and all associated resources have been deleted.`
    );
  } catch (error) {
    logger().error(`Error deleting user or resources: ${error.message}`);
    throw new Error(`Error deleting user or resources: ${error.message}`);
  }
}
async function deleteAllAccessKeys(userName: string, iamClient: IAMClient) {
  const listAccessKeysCommand = new ListAccessKeysCommand({
    UserName: userName,
  });
  const listAccessKeysResponse = await iamClient.send(listAccessKeysCommand);

  if (!listAccessKeysResponse.AccessKeyMetadata) {
    throw new Error('Cannot read access key metadata');
  }

  for (const accessKey of listAccessKeysResponse.AccessKeyMetadata) {
    const deleteAccessKeyCommand = new DeleteAccessKeyCommand({
      UserName: userName,
      AccessKeyId: accessKey.AccessKeyId,
    });
    await iamClient.send(deleteAccessKeyCommand);
  }
}
