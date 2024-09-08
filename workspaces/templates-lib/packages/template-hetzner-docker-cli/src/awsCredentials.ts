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
} from '@aws-sdk/client-iam';
import { S3Client, PutBucketPolicyCommand } from '@aws-sdk/client-s3';
import { getAWSUser, getAWSCredentials } from '@goldstack/infra-aws';
import { HetznerDockerDeployment } from '@goldstack/template-hetzner-docker';

import { STSClient, GetCallerIdentityCommand } from '@aws-sdk/client-sts';

async function checkIfUserExists(iamClient: IAMClient, userName: string) {
  try {
    const getUserCommand = new GetUserCommand({ UserName: userName });
    await iamClient.send(getUserCommand);
    console.log(`User ${userName} exists.`);
    return true;
  } catch (error) {
    if (error.name === 'NoSuchEntityException') {
      console.log(`User ${userName} does not exist.`);
      return false;
    }
    throw error;
  }
}

async function createUser(iamClient: IAMClient, userName: string) {
  console.log(`Creating user ${userName}...`);
  const createUserCommand = new CreateUserCommand({ UserName: userName });
  const createUserResponse = await iamClient.send(createUserCommand);
  if (!createUserResponse.User) {
    throw new Error('User could not be created.');
  }
  console.log(`User ${userName} created.`);
}

async function createAccessKey(iamClient: IAMClient, userName: string) {
  console.log(`Creating access key for user ${userName}...`);
  const createAccessKeyCommand = new CreateAccessKeyCommand({
    UserName: userName,
  });
  const createAccessKeyResponse = await iamClient.send(createAccessKeyCommand);
  if (!createAccessKeyResponse.AccessKey) {
    throw new Error('Cannot create new access key for user.');
  }
  console.log(`Access key created for user ${userName}.`);
  return {
    accessKeyId: createAccessKeyResponse.AccessKey.AccessKeyId,
    secretAccessKey: createAccessKeyResponse.AccessKey.SecretAccessKey,
  };
}

async function getAccountId(client: STSClient): Promise<string> {
  const command = new GetCallerIdentityCommand({});
  try {
    const data = await client.send(command);
    if (!data.Account) {
      throw new Error('Account ID not found in response');
    }
    return data.Account;
  } catch (err) {
    console.error('Error retrieving account ID:', err);
    throw err;
  }
}

async function attachPolicyToUser(
  iamClient: IAMClient,
  userName: string,
  bucketName: string,
  s3Client: S3Client,
  stsClient: STSClient
) {
  console.log(
    `Attaching policy to user ${userName} for bucket ${bucketName}...`
  );
  const principal = `arn:aws:iam::${await getAccountId(
    stsClient
  )}:user/${userName}`;

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
        Principal: {
          AWS: principal,
        },
      },
    ],
  };

  const putBucketPolicyCommand = new PutBucketPolicyCommand({
    Bucket: bucketName,
    Policy: JSON.stringify(policy),
  });
  await s3Client.send(putBucketPolicyCommand);

  const attachUserPolicyCommand = new AttachUserPolicyCommand({
    UserName: userName,
    PolicyArn: 'arn:aws:iam::aws:policy/AmazonS3ReadOnlyAccess',
  });
  await iamClient.send(attachUserPolicyCommand);
  console.log(`Policy attached to user ${userName}.`);
}

export async function createUserWithReadOnlyS3Access(params: {
  deployment: HetznerDockerDeployment;
  vpsUserName: string;
  bucketName: string;
}): Promise<{
  accessKeyId: string | undefined;
  secretAccessKey: string | undefined;
  awsRegion: string | undefined;
}> {
  const { bucketName, vpsUserName: userName, deployment } = params;
  const awsUser = await getAWSUser(deployment.awsUser);
  const credentials = await getAWSCredentials(awsUser);

  const s3Client = new S3Client({
    credentials: credentials,
    region: deployment.awsRegion,
  });

  const iamClient = new IAMClient({
    credentials: credentials,
    region: deployment.awsRegion,
  });

  const stsClient = new STSClient({
    credentials,
    region: deployment.awsRegion,
  });

  try {
    const userExists = await checkIfUserExists(iamClient, userName);

    if (!userExists) {
      await createUser(iamClient, userName);
      await attachPolicyToUser(
        iamClient,
        userName,
        bucketName,
        s3Client,
        stsClient
      );
    }

    const accessKeys = await createAccessKey(iamClient, userName);

    return {
      ...accessKeys,
      awsRegion: deployment.awsRegion,
    };
  } catch (error) {
    console.error(`Error creating user or attaching policy: ${error.message}`);
    throw new Error(
      `Error creating user or attaching policy: ${error.message}`
    );
  }
}

export async function deleteUserAndResources(params: {
  deployment: HetznerDockerDeployment;
  vpsUserName: string;
}) {
  const userName = params.vpsUserName;
  const awsUser = await getAWSUser(params.deployment.awsUser);
  const credentials = await getAWSCredentials(awsUser);

  const iamClient = new IAMClient({
    credentials: credentials,
    region: params.deployment.awsRegion,
  });

  try {
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

    const detachUserPolicyCommand = new DetachUserPolicyCommand({
      UserName: userName,
      PolicyArn: 'arn:aws:iam::aws:policy/AmazonS3ReadOnlyAccess',
    });
    await iamClient.send(detachUserPolicyCommand);

    const deleteUserCommand = new DeleteUserCommand({ UserName: userName });
    await iamClient.send(deleteUserCommand);
  } catch (error) {
    console.error(`Error deleting user or resources: ${error.message}`);
    throw new Error(`Error deleting user or resources: ${error.message}`);
  }
}
