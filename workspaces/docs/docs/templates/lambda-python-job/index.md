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

This module requires further security hardening when deployed in critical production applications. Specifically the lambda is given the role `arn:aws:iam::aws:policy/AdministratorAccess"` and this will grant the lambda access to all resources on the AWS account, including the ability to create and destroy infrastructure. It is therefore recommended to grant this lambda only rights to resources it needs access to, such as read and write permissions for an S3 bucket. This can be modified in `infra/aws/lambda.tf` in the resource `resource "aws_iam_role_policy_attachment" "lambda_admin_role_attach"`.
