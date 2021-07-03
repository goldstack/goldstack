import AWS from 'aws-sdk';

const assertDynamoDBTable = async (params: {
  dynamoDB: AWS.DynamoDB;
  tableName: string;
}) => {
  // defining a table as required by Terraform https://www.terraform.io/docs/language/settings/backends/s3.html#dynamodb_table
  const tableDef = {
    AttributeDefinitions: [
      {
        AttributeName: 'LockId',
        AttributeType: 'S',
      },
    ],
    KeySchema: [
      {
        AttributeName: 'LockId',
        KeyType: 'HASH',
      },
    ],
    TableName: params.tableName,
    BillingMode: 'PAY_PER_REQUEST',
  };

  const resp = await params.dynamoDB.createTable(tableDef).promise();

  const error = resp.$response.error;
  // if there is a resource in use exception, ignore it.
  if (error && error.code !== 'ResourceInUseException') {
    throw new Error(error.message);
  }
};

const assertS3Bucket = async (params: {
  s3: AWS.S3;
  bucketName: string;
}): Promise<void> => {
  const bucketParams = {
    Bucket: params.bucketName,
  };
  const resp = await params.s3.createBucket(bucketParams).promise();
  const error = resp.$response.error;
  // if bucket already exists, ignore error
  if (error && error.code !== 'BucketAlreadyExists') {
    throw new Error(error.message);
  }
};

export const createState = async (params: {
  credentials: AWS.Credentials;
  dynamoDBTableName: string;
  bucketName: string;
}): Promise<void> => {
  const dynamoDB = new AWS.DynamoDB({ apiVersion: '2012-08-10' });
  await assertDynamoDBTable({ dynamoDB, tableName: params.dynamoDBTableName });
  const s3 = new AWS.S3({ apiVersion: '2006-03-01' });
  await assertS3Bucket({ s3, bucketName: params.bucketName });
};
