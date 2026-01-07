/**
 * Configuration options for local DynamoDB instances
 */
export interface DynamoDBConfig {
  /** Port to use for the DynamoDB instance */
  port: number;
  /** Region to use for the DynamoDB client */
  region: string;
  /** Credentials for local DynamoDB access */
  credentials: {
    accessKeyId: string;
    secretAccessKey: string;
  };
}

/**
 * Default configuration for local DynamoDB instances
 */
export const defaultConfig: DynamoDBConfig = {
  port: parseInt(process.env.DYNAMODB_LOCAL_PORT || '8000', 10),
  region: 'eu-central-1',
  credentials: {
    accessKeyId: 'dummy',
    secretAccessKey: 'dummy',
  },
};

/**
 * Gets the endpoint URL for a DynamoDB instance
 */
export function getEndpointUrl(port: number): string {
  return `http://127.0.0.1:${port}`;
}

/**
 * Checks if we are running in a Jest test environment
 */
export function isTestEnvironment(): boolean {
  return process.env.JEST_WORKER_ID !== undefined;
}
