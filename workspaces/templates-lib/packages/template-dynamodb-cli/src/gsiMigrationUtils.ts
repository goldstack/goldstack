import {
  AttributeDefinition,
  DescribeTableCommand,
  KeyType,
  ProjectionType,
  UpdateTableCommand,
} from '@aws-sdk/client-dynamodb';
import type { DynamoDBContext } from '@goldstack/template-dynamodb';
import { info } from '@goldstack/utils-log';

/**
 * Creates a single GSI and waits for it to become active
 */
export async function createGsi(
  context: DynamoDBContext,
  indexName: string,
  existingAttributes: AttributeDefinition[],
): Promise<void> {
  info(`Starting GSI creation: ${indexName}`);

  // Prepare attribute definitions for this GSI
  const gsiAttributes: AttributeDefinition[] = [
    {
      AttributeName: `${indexName}_pk`,
      AttributeType: 'S',
    },
    {
      AttributeName: `${indexName}_sk`,
      AttributeType: 'S',
    },
  ];

  // Filter to only attributes not already defined
  const existingAttributeNames = new Set(
    existingAttributes.map((attr) => attr.AttributeName!).filter(Boolean),
  );

  const attributesToAdd = gsiAttributes.filter(
    (attr) => !existingAttributeNames.has(attr.AttributeName!),
  );

  const newAttributes: AttributeDefinition[] = [...existingAttributes, ...attributesToAdd];

  info(`Creating GSI ${indexName} with ${attributesToAdd.length} new attributes`);

  await context.client.send(
    new UpdateTableCommand({
      TableName: context.tableName,
      AttributeDefinitions: newAttributes,
      GlobalSecondaryIndexUpdates: [
        {
          Create: {
            IndexName: indexName,
            KeySchema: [
              {
                AttributeName: `${indexName}_pk`,
                KeyType: KeyType.HASH,
              },
              {
                AttributeName: `${indexName}_sk`,
                KeyType: KeyType.RANGE,
              },
            ],
            Projection: {
              ProjectionType: ProjectionType.ALL,
            },
          },
        },
      ],
    }),
  );

  info(`GSI ${indexName} creation initiated, waiting for activation...`);

  // Wait for GSI to become active (30 minute timeout with 520 retries, progressive delay)
  let active = false;
  let retriesLeft = 520;
  let delayIndex = 0;
  while (!active && retriesLeft > 0) {
    const describe = await context.client.send(
      new DescribeTableCommand({ TableName: context.tableName }),
    );

    const gsi = describe.Table?.GlobalSecondaryIndexes?.find((idx) => idx.IndexName === indexName);

    info(`GSI ${indexName} status: ${gsi?.IndexStatus} (${retriesLeft} retries remaining)`);
    active = gsi?.IndexStatus === 'ACTIVE';
    if (!active) {
      // Progressive delay: starts at 1s, increases by 10ms each retry
      const delayMs = 1000 + delayIndex * 10;
      info(`Waiting ${delayMs}ms before next check (delay index: ${delayIndex})`);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
      delayIndex++;
    }
    retriesLeft--;
  }

  if (!active) {
    throw new Error(`GSI ${indexName} failed to become active within 30 minutes`);
  }

  info(`GSI ${indexName} is now active`);
}

/**
 * Deletes a single GSI and waits for the table to become active
 */
export async function deleteGsi(context: DynamoDBContext, indexName: string): Promise<void> {
  info(`Starting GSI deletion: ${indexName}`);

  await context.client.send(
    new UpdateTableCommand({
      TableName: context.tableName,
      GlobalSecondaryIndexUpdates: [
        {
          Delete: {
            IndexName: indexName,
          },
        },
      ],
    }),
  );

  info(`GSI ${indexName} deletion initiated, waiting for table to be active...`);

  // Wait for table to be active after GSI deletion (30 minute timeout with 520 retries, progressive delay)
  let tableActive = false;
  let retriesLeft = 520;
  let delayIndex = 0;
  while (!tableActive && retriesLeft > 0) {
    const describe = await context.client.send(
      new DescribeTableCommand({ TableName: context.tableName }),
    );

    tableActive = describe.Table?.TableStatus === 'ACTIVE';
    info(
      `Table status after deleting ${indexName}: ${describe.Table?.TableStatus} (${retriesLeft} retries remaining)`,
    );
    if (!tableActive) {
      // Progressive delay: starts at 1s, increases by 10ms each retry
      const delayMs = 1000 + delayIndex * 10;
      info(`Waiting ${delayMs}ms before next check (delay index: ${delayIndex})`);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
      delayIndex++;
    }
    retriesLeft--;
  }

  if (!tableActive) {
    throw new Error(
      `Table failed to become active after deleting GSI ${indexName} within 30 minutes`,
    );
  }

  info(`Table is now active after deleting GSI ${indexName}`);
}

/**
 * Checks if a GSI exists on the table
 */
export async function gsiExists(context: DynamoDBContext, indexName: string): Promise<boolean> {
  const tableDescription = await context.client.send(
    new DescribeTableCommand({
      TableName: context.tableName,
    }),
  );

  return (
    tableDescription.Table?.GlobalSecondaryIndexes?.some(
      (index) => index.IndexName === indexName,
    ) ?? false
  );
}

/**
 * Gets existing attribute definitions from the table
 */
export async function getExistingAttributes(
  context: DynamoDBContext,
): Promise<AttributeDefinition[]> {
  const tableDescription = await context.client.send(
    new DescribeTableCommand({
      TableName: context.tableName,
    }),
  );

  return tableDescription.Table?.AttributeDefinitions || [];
}
