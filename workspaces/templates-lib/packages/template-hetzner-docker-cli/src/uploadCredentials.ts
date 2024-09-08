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

export async function createUserWithReadOnlyS3Access(params: {
  deployment: HetznerDockerDeployment;
  vpsUserName: string;
  bucketName: string;
}) {
  const bucketName = params.bucketName;
  const userName = params.vpsUserName;
  const awsUser = await getAWSUser(params.deployment.awsUser);

  const credentials = await getAWSCredentials(awsUser);
  const s3Client = new S3Client({
    credentials: credentials,
    region: params.deployment.awsRegion,
  });

  const iamClient = new IAMClient({
    credentials: credentials,
    region: params.deployment.awsRegion,
  });

  try {
    // Check if the user already exists
    try {
      const getUserCommand = new GetUserCommand({ UserName: userName });
      await iamClient.send(getUserCommand);
      return; // User already exists, do nothing
    } catch (error) {
      if (error.name !== 'NoSuchEntity') {
        throw error;
      }
    }

    // Create IAM user
    const createUserCommand = new CreateUserCommand({ UserName: userName });
    const createUserResponse = await iamClient.send(createUserCommand);

    if (!createUserResponse.User) {
      throw new Error('User could not be created.');
    }

    // Create access key for the user
    const createAccessKeyCommand = new CreateAccessKeyCommand({
      UserName: userName,
    });
    const createAccessKeyResponse = await iamClient.send(
      createAccessKeyCommand
    );

    // Attach policy to the user to allow read-only S3 access
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

    const putBucketPolicyCommand = new PutBucketPolicyCommand({
      Bucket: bucketName,
      Policy: JSON.stringify(policy),
    });
    await s3Client.send(putBucketPolicyCommand);

    // Attach AmazonS3ReadOnlyAccess policy to the user (optional, for broader read-only access)
    const attachUserPolicyCommand = new AttachUserPolicyCommand({
      UserName: userName,
      PolicyArn: 'arn:aws:iam::aws:policy/AmazonS3ReadOnlyAccess',
    });
    await iamClient.send(attachUserPolicyCommand);

    if (!createAccessKeyResponse.AccessKey) {
      throw new Error('User access key is not defined.');
    }

    // Return the access key and secret key
    return {
      accessKeyId: createAccessKeyResponse.AccessKey.AccessKeyId,
      secretAccessKey: createAccessKeyResponse.AccessKey.SecretAccessKey,
    };
  } catch (error) {
    throw new Error(
      `Error creating user or attaching policy: ${error.message}`
    );
  }
}

export async function deleteUserAndResources(params: {
  deployment: HetznerDockerDeployment;
  vpsUserName: string;
  bucketName: string;
}) {
  const userName = params.vpsUserName;
  const awsUser = await getAWSUser(params.deployment.awsUser);

  const credentials = await getAWSCredentials(awsUser);

  const iamClient = new IAMClient({
    credentials: credentials,
    region: params.deployment.awsRegion,
  });

  try {
    // List access keys for the user
    const listAccessKeysCommand = new ListAccessKeysCommand({
      UserName: userName,
    });
    const listAccessKeysResponse = await iamClient.send(listAccessKeysCommand);

    if (!listAccessKeysResponse.AccessKeyMetadata) {
      throw new Error('Cannot read access key metadata');
    }
    // Delete each access key
    for (const accessKey of listAccessKeysResponse.AccessKeyMetadata) {
      const deleteAccessKeyCommand = new DeleteAccessKeyCommand({
        UserName: userName,
        AccessKeyId: accessKey.AccessKeyId,
      });
      await iamClient.send(deleteAccessKeyCommand);
    }

    // Detach AmazonS3ReadOnlyAccess policy from the user
    const detachUserPolicyCommand = new DetachUserPolicyCommand({
      UserName: userName,
      PolicyArn: 'arn:aws:iam::aws:policy/AmazonS3ReadOnlyAccess',
    });
    await iamClient.send(detachUserPolicyCommand);

    // Delete the IAM user
    const deleteUserCommand = new DeleteUserCommand({ UserName: userName });
    await iamClient.send(deleteUserCommand);
  } catch (error) {
    throw new Error(`Error deleting user or resources: ${error.message}`);
  }
}
