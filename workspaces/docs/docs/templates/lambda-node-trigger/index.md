---
id: template-lambda-node-trigger
title: Lambda Node Trigger
---

[!embed](./about.md)

## Features

- Write Node.js code and deploy it to AWS Lambda
- Includes command line utilities to package code as ZIP and to deploy to AWS Lambda
- Trigger the function according to a schedule (e.g. once per hour) and/or based on messages received in an SQS queue

## Getting Started

You can start developing you code in the file `src/handler.ts`. Simply add the logic you require there:

```typescript
export const handler: Handler = async (event, context) => {
  // SQS message
  if (event.Records) {
    const sqsEvent = event as SQSEvent;
    const message = sqsEvent.Records[0].body;
    console.log('SQS message received:');
    console.log(message);
    return;
  }

  if (event['detail-type'] && event['detail-type'] === 'Scheduled Event') {
    const time = event['time'];
    console.log(`This is a scheduled event from ${time}`);
    return;
  }
};
```

You can send messages from other Lambdas to the queue as follows:

```
import { SendMessageCommand, SQSClient } from "@aws-sdk/client-sqs";

import { getSQSQueueURL } from '@yourproject/your-ses-package';

export const sendHelloWorldMessage = async (queueName: string) => {

  const client = new SQSClient({});
  const queueUrl = getSQSQueueURL();

  const command = new SendMessageCommand({
    QueueUrl: queueUrl,
    MessageBody: "Hello World",
  });

  try {
    const response = await client.send(command);
    console.log("Message sent successfully:", response);
    return response;
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
};
```

Make sure to install the SQS client package in the Lambda that should write to the queue:

```
yarn add @aws-sdk/client-sqs
```

Also you need to add your handler lambda as dependency (to the lambda that should send message to it).

```
yarn add @yourproject/your-ses-package
```

## Infrastructure

[!embed](./../shared/infrastructure.md)

## Deployment

[!embed](./../shared/deployment.md)

The ZIP file that is deployed is stored in the template directory as `lambda.zip`.

Note it is also possible to only build the ZIP package locally without uploading it. For this, run:

```
yarn build
```

This will copy the files that need to be deployed into the folder `distLambda/`.

## Guides and How Tos

### Adding environment variables

[!embed](./../lambda-express/environment-variables.md)

## Security Hardening

This module requires further security hardening when deployed in critical production applications. Specifically the lambda is given the role `arn:aws:iam::aws:policy/AdministratorAccess"` and this will grant the lambda access to all resources on the AWS account, including the ability to create and destroy infrastructure. It is therefore recommended to grant this lambda only rights to resources it needs access to, such as read and write permissions for an S3 bucket. This can be modified in `infra/aws/lambda.tf` in the resource `resource "aws_iam_role_policy_attachment" "lambda_admin_role_attach"`.
