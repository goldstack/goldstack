import {
  type AttributeValue,
  DeleteItemCommand,
  type DynamoDBClient,
  PutItemCommand,
  QueryCommand,
  type QueryCommandOutput,
} from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { debug } from '@goldstack/utils-log';
import type { UmzugStorage } from 'umzug';
import type { MigrationParams } from 'umzug/lib/types';
import type { DynamoDBContext } from './dynamoDBMigrations';

export class DynamoDBStorage implements UmzugStorage<DynamoDBContext> {
  dynamoClient: DynamoDBClient;
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
    dynamoDB: DynamoDBClient;
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
      await params.context.client.send(
        new PutItemCommand({
          TableName: this.tableName,
          Item: {
            [this.partitionKey]: { S: this.migrationsKey },
            [this.sortKey]: { S: params.name },
          },
        }),
      );
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : String(e);
      throw new Error(`Failed to log migration ${params.name}. DynamoDB error: ${errorMessage}`);
    }
  }

  async unlogMigration(params: MigrationParams<DynamoDBContext>): Promise<void> {
    try {
      await params.context.client.send(
        new DeleteItemCommand({
          TableName: this.tableName,
          Key: {
            [this.partitionKey]: { S: this.migrationsKey },
            [this.sortKey]: { S: params.name },
          },
        }),
      );
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : String(e);
      throw new Error(`Failed to unlog migration ${params.name}. DynamoDB error: ${errorMessage}`);
    }
  }

  async executed(): Promise<string[]> {
    const migrations: { [key: string]: any }[] = [];
    let lastEvaluatedKey: Record<string, AttributeValue> | undefined;

    do {
      try {
        const res: QueryCommandOutput = await this.dynamoClient.send(
          new QueryCommand({
            TableName: this.tableName,
            KeyConditionExpression: '#pk = :pk',
            ExpressionAttributeNames: {
              '#pk': this.partitionKey,
            },
            ExpressionAttributeValues: marshall({
              ':pk': this.migrationsKey,
            }),
            ExclusiveStartKey: lastEvaluatedKey,
          }),
        );

        lastEvaluatedKey = res.LastEvaluatedKey;
        const items = res.Items?.map((entry) => unmarshall(entry)) || [];
        migrations.push(...items);
      } catch (e) {
        const errorMessage = e instanceof Error ? e.message : String(e);
        throw new Error(`Failed to fetch executed migrations. DynamoDB error: ${errorMessage}`);
      }
    } while (lastEvaluatedKey);

    return migrations.map((m) => m[this.sortKey]);
  }
}
