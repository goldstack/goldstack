# Goldstack Template Framework

The Goldstack Template Framework provides a collection of utilities to develop customisable starter templates.

This framework is used by starter projects built with the [Goldstack Starter Project Builder](https://goldstack.party/build). However, it can be used to enhance any Node.js application, specifically for configuring and deploying infrastructure.

The following packages show how the framework can be employed to configured modules with associated infrastructure:

- [template-docker-image-aws](https://github.com/goldstack/goldstack/tree/master/workspaces/templates-lib/packages/template-docker-image-aws): For developing a Node.js application that is deployed to AWS Fargate.
- [template-email-send](https://github.com/goldstack/goldstack/tree/master/workspaces/templates-lib/packages/template-email-send): For developing a Node.js module that provides capabilities for sending emails via AWS SES.
- [template-lambda-express](https://github.com/goldstack/goldstack/tree/master/workspaces/templates-lib/packages/template-lambda-express): For developing an Express.js server that is deployed as AWS Lambda.
- [template-nextjs](https://github.com/goldstack/goldstack/tree/master/workspaces/templates-lib/packages/template-nextjs#goldstack-nextjs-template-tools): For developing a Next.js application that is deployed using AWS S3 and CloudFront.
- [template-s3](https://github.com/goldstack/goldstack/tree/master/workspaces/templates-lib/packages/template-s3#goldstack-s3-template-tools): For developing Node.js modules that wrap the interaction with an AWS S3 bucket.
- [template-static-website-aws](https://github.com/goldstack/goldstack/tree/master/workspaces/templates-lib/packages/template-static-website-aws): For developing static websites that are deployed to AWS S3 and CloudFront.

For more information, see the [Goldstack Homepage](https://goldstack.party/) or the [Goldstack Documentation](https://docs.goldstack.party/docs/).
