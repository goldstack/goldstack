# Goldstack AWS Lambda Tools

This library provides a simple wrapper around the AWS CLI to deploy Lambdas and define Lambda infrastructure.

## deployFunction

This function will deploy an AWS lambda. Note this function will either need Docker to be available locally or the AWS cli.

```typescript
interface DeployFunctionParams {
  lambdaPackageDir: string;
  targetArchiveName?: string;
  awsCredentials: AWSCredentialIdentity;
  region: string;
  functionName: string;
}

function async deployFunction(
  params: DeployFunctionParams
): Promise<any> {}
```

## readLambdaConfig

This function will generate a configuration for AWS HTTP API Gateway based on `.ts` files in a folder. For more information, see [Goldstack Documentation - Defining Routes](https://docs.goldstack.party/docs/templates/serverless-api#defining-routes-1)

```typescript
export interface LambdaConfig {
  name: string;
  type: RouteType;
  absoluteFilePath: string;
  relativeFilePath: string;
  path: string;
  route: string;
}

function readLambdaConfig(dir: string): LambdaConfig[] {}
```
