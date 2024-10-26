The following key properties need to be configured for this template:

- **Lambda Name**: The [name](https://docs.aws.amazon.com/lambda/latest/dg/API_CreateFunction.html#SSS-CreateFunction-request-FunctionName) to be used for this lambda. Lambda names need to be unique for the AWS Region. It is not possible to have two lambdas with the same name in the same region.
- **Lambda Schedule** (Optional): This defines the schedule at which the lambda is triggered. For example, `"rate(1 minute)"`. For more information, see the [AWS Schedule Pattern documentation](https://docs.aws.amazon.com/eventbridge/latest/userguide/eb-scheduled-rule-pattern.html#eb-rate-expressions).
- **SQS Queue Name** (Optional): This defines the name of the SQS queue that is used to trigger the lambda. The SQS queue should not already exist, and it will be created when the name is provided.
