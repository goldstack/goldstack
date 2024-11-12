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

### Changing into a FIFO Queue

If you would like the Lambda to processes messages in order and one by one, it is best to use a [FIFO queue](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/sqs_queue.html#fifo-queue).

Modify `queue.tf` by adding `.fifo` to the `name` property and adding the property `fifo_queue` as below for both the main queue and DLQ queue:

```
# Only create the SQS queue if sqs_queue_name is provided
resource "aws_sqs_queue" "queue" {
  # ...
  name  = "${var.lambda_name}-queue.fifo"
  fifo_queue                  = true # this ensures the lambda processes messages one by one
  # ...
}
```

resource "aws_sqs_queue" "dlq" {
  count = length(var.sqs_queue_name) > 0 ? 1 : 0
  name  = "${var.lambda_name}-dlq.fifo"
  fifo_queue                  = true # this ensures the lambda processes messages one by one
}
```

Ensure that for every message sent to the queue to provide the following two fields:

```
MessageGroupId: ';
MessageDeduplicationId: ''
```

We also need to remove the DQL configuration from `lambda.tf` - specifically REMOVE the following:

```
  # Configure Dead-letter Queue for Lambda errors if DLQ is created
  dynamic "dead_letter_config" {
    for_each = length(aws_sqs_queue.dlq) > 0 ? [1] : []
    content {
      target_arn = aws_sqs_queue.dlq[0].arn
    }
  }
```

If you want to use a DLQ for the main lambda, simply create another queue.

## Security Hardening

This module requires further security hardening when deployed in critical production applications. Specifically the lambda is given the role `arn:aws:iam::aws:policy/AdministratorAccess"` and this will grant the lambda access to all resources on the AWS account, including the ability to create and destroy infrastructure. It is therefore recommended to grant this lambda only rights to resources it needs access to, such as read and write permissions for an S3 bucket. This can be modified in `infra/aws/lambda.tf` in the resource `resource "aws_iam_role_policy_attachment" "lambda_admin_role_attach"`.
