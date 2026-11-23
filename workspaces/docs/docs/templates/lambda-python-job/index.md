---
id: template-lambda-python-job
title: Lambda Python Job
---

[!embed](./about.md)

## Features

- Write Python code and deploy it to AWS Lambda
- Includes command line utilities to package code as ZIP and to deploy to AWS Lambda
- Trigger the function according to a schedule (e.g. once per hour) and/or based on messages received in an SQS queue

## Getting Started

In order to develop your Python Lambda, go to the `lambda/` directory contained in the template.

First, we need to initialise a virtual environment:

```
python -m venv lambda_env
```

Then activate the environment:

```
source lambda_env/Scripts/activate # Windows
source venv/bin/activate # Linux/ iOS
```

Finally install the dependencies:

```
pip install -r requirements.txt
```

Now you are ready to develop your Python function.

Open the `lambda/lambda.py` file in VSCode.

Then ensure that the correct environment is selected (see [VSCode Docs: Select and Activate and Environment](https://code.visualstudio.com/docs/python/environments#_select-and-activate-an-environment). For this, click on the bottom right of your editor where python is referenced. Click there to select an interpreter, and then point to the Python executable that is in the `lambda_env` folder.

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

By default the lambda uses the shared execution role module in `infra/aws/shared/lambda-execution-role` at the project root. This role grants broad access to AWS resources commonly used by Goldstack applications, including S3, DynamoDB, Cognito, SQS, SNS, SES, CloudWatch, Secrets Manager and Systems Manager. This makes it easy to get started, but for production applications you should restrict the policy in `infra/aws/shared/lambda-execution-role/main.tf` to only the resources this lambda needs, or attach a permissions boundary via the module's `permissions_boundary` input.
