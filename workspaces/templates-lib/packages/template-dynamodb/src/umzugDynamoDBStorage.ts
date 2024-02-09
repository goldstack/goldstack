import {
  AttributeValue,
  DeleteItemCommand,
  DynamoDBClient,
  PutItemCommand,
  QueryCommand,
  QueryCommandOutput,
} from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { UmzugStorage } from 'umzug';
import { MigrationParams } from 'umzug/lib/types';
import { DynamoDBContext } from './dynamoDBMigrations';

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
            [this.sortKey]: { S: this.sortKey },
          },
        })
      );
    } catch (e) {
      throw new Error(`Failed to log migration ${params.name}. ` + e);
    }
  }

  async unlogMigration(
    params: MigrationParams<DynamoDBContext>
  ): Promise<void> {
    try {
      await params.context.client.send(
        new DeleteItemCommand({
          TableName: this.tableName,
          Key: {
            [this.partitionKey]: { S: this.migrationsKey },
            [this.sortKey]: { S: params.name },
          },
        })
      );
    } catch (e) {
      throw new Error(`Failed to unlog migration ${params.name}. ` + e);
    }
  }

  async executed(): Promise<string[]> {
    const migrations: { [key: string]: any }[] = [];
    let itemsLength: number | undefined = undefined;
    let lastEvaluatedKey: Record<string, AttributeValue> | undefined =
      undefined;
    do {
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
        })
      );
      lastEvaluatedKey = res.LastEvaluatedKey;
      const items: { [key: string]: any }[] | undefined = res?.Items?.map(
        (entry) => {
          return unmarshall(entry);
        }
      );
      if (items) {
        migrations.push(...items);
      }
      itemsLength = res?.Items?.length;
    } while (itemsLength && lastEvaluatedKey);

    return migrations.map((m) => m[this.sortKey]);
  }
}
