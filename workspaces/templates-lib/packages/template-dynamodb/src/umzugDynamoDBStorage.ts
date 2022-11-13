import DynamoDB from 'aws-sdk/clients/dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { PromiseResult } from 'aws-sdk/lib/request';
import { AWSError } from 'aws-sdk/lib/error';
import { UmzugStorage } from 'umzug';
import { MigrationParams } from 'umzug/lib/types';
import { DynamoDBContext } from './dynamoDBMigrations';

export class DynamoDBStorage implements UmzugStorage<DynamoDBContext> {
  dynamoClient: DynamoDB;
  tableName: string;
  migrationsKey: string;
  partitionKey: string;
  sortKey: string;

  constructor({
    dynamoDB,
    tableName,
    migrationsKey = '#MIGRATIONS',
    partitionKey = 'pk',
    sortKey = 'sk',
  }: {
    dynamoDB: DynamoDB;
    tableName: string;
    migrationsKey?: string;
    partitionKey?: string;
    sortKey?: string;
  }) {
    this.dynamoClient = dynamoDB;
    this.tableName = tableName;
    this.migrationsKey = migrationsKey;
    this.partitionKey = partitionKey;
    this.sortKey = sortKey;
  }

  async logMigration(params: MigrationParams<DynamoDBContext>): Promise<void> {
    try {
      await params.context.client
        .putItem({
          TableName: params.context.tableName,
          Item: marshall({
            [this.partitionKey]: this.migrationsKey,
            [this.sortKey]: params.name,
          }),
        })
        .promise();
    } catch (e) {
      throw new Error(`Failed to log migration ${params.name}. ` + e);
    }
  }

  async unlogMigration(
    params: MigrationParams<DynamoDBContext>
  ): Promise<void> {
    try {
      await params.context.client
        .deleteItem({
          TableName: this.tableName,
          Key: marshall({
            [this.partitionKey]: this.migrationsKey,
            [this.sortKey]: params.name,
          }),
        })
        .promise();
    } catch (e) {
      throw new Error(`Failed to unlog migration ${params.name}. ` + e);
    }
  }

  async executed(): Promise<string[]> {
    const migrations: { [key: string]: any }[] = [];
    let res: PromiseResult<DynamoDB.QueryOutput, AWSError> | undefined =
      undefined;
    let lastEvaluatedKey: DynamoDB.Key | undefined = undefined;
    do {
      res = await this.dynamoClient
        .query({
          TableName: this.tableName,
          KeyConditionExpression: '#pk = :pk',
          ExpressionAttributeNames: {
            '#pk': this.partitionKey,
          },
          ExpressionAttributeValues: marshall({
            ':pk': this.migrationsKey,
          }),
          ExclusiveStartKey: lastEvaluatedKey,
        })
        .promise();
      lastEvaluatedKey = res.LastEvaluatedKey;
      const items: { [key: string]: any }[] | undefined = res?.Items?.map(
        (entry) => {
          return unmarshall(entry);
        }
      );
      if (items) {
        migrations.push(...items);
      }
    } while (res?.Items?.length && lastEvaluatedKey);

    return migrations.map((m) => m[this.sortKey]);
  }
}
