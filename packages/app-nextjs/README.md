# Next.js Template

❤️ Support development by using the [Goldstack Project Builder](https://goldstack.party) ❤️

Goldstack's Next.js module provides a [Next.js](https://nextjs.org/) application that is deployed on AWS using the [CloudFront CDN](https://aws.amazon.com/cloudfront/) and [Lambda@Edge](https://aws.amazon.com/lambda/edge/).

## Configure

The following key properties need to be configured for this module:

*   **Hosted Zone Domain**: A Route 53 hosted zone to which the *Primary Website Domain* and *Redirect Website Domain* can be added as records. For instance, the hosted zone domain `mysite.com` would allow adding the primary domain `mysite.com` and the redirect domain `www.mysite.com`. For more details, please check [Hosted Zone Configuration](https://docs.goldstack.party/docs/goldstack/configuration#hosted-zone-configuration) in the Goldstack documentation.
*   **Primary Website Domain**: This is the domain your users will use to view the site. For instance, if you configure the domain `mysite.com`, users will be able to view your site by opening the URL `https://mysite.com`.
*   **Redirect Website Domain**: This is a domain that will redirect all requests to your *Primary Website Domain*. The redirect website domain *must be* different to the *Primary Website Domain*. For instance, if you configure the domain `mysite.com` as your primary domain, you can configure `www.mysite.com` as your redirect domain. Users will be redirected to `https://mysite.com` when they attempt to open the URL `https://www.mysite.com`. Note that the *Redirect Website Domain* must be configured, even if you do not need this functionality.
*   **Default Cache Duration**: The number of seconds that files will be cached in the AWS content delivery network. Setting this to `120` for instance, would mean that, unless otherwise specified, webpages and other resources will be cached for 120 s. In that case, when a new version of a page is deployed, it can take up to 120 s for changes to appear when accessing the deployed version of the application.

*   **Environment Variables**: Configures environment variables for the application. Environment variables without the prefix `NEXT_PUBLIC_` will only be available during build time of the application. For more information see [Environment Variables](https://nextjs.org/docs/basic-features/environment-variables) in the Next.js documentation.

## Features

*   Optimised for TypeScript
*   Configured for unit testing using Jest and React Testing library
*   Scalable AWS infrastructure defined in Terraform; all content served through the powerful CloudFront CDN and stored in S3 at very low costs. This [blog article](https://simonecarletti.com/blog/2016/08/redirect-domain-https-amazon-cloudfront/) shows how a similar setup could be created manually.
*   Full support for SSL - using free certificates issued by AWS.
*   CDN caching optimised for Next.js (e.g. all files in `_next/static` are automatically cached on the CDN and the client)
*   Configurable with your own domain name
*   Rolling out of infrastructure and deployment supported through easy to use scripts

## Getting Started

### Infrastructure

The first thing we recommend to do with a new module is to stand up the infrastructure for the module. For this, find the directory for this module in the `packages/` folder and navigate to this folder in the command line. Then identify the name of the deployment you have defined in the Goldstack configuration tool. This can be found in the `packages/[moduleName]/goldstack.json` file. Look for the `"deployments"` property and there for the `"name"` of the first deployment. The name should either be `dev` or `prod`.

In order to stand up the infrastructure, run the following command:

```bash
yarn infra up [deploymentName]
```

This will be either `yarn infra up dev` or `yarn infra up prod` depending on your choice of deployment. Note that running this command can take a while.

### Deployment

Once the infrastructure is successfully set up in AWS using `yarn infra up`, we can deploy the module. For this, simply run the following command:

```bash
yarn deploy [deploymentName]
```

This will either be `yarn deploy dev` or `yarn deploy prod` depending on your choice of deployment during project configuration.

### Development

Goldstack's Next.js module is a simple wrapper around a standard Next.js project. Please see the [Next.js documentation](https://nextjs.org/docs/basic-features/pages) for details on how to develop a Next.js application. Generally, the folder `src/pages` is a good starting point.

## Infrastructure

All infrastructure for this module is defined in Terraform. You can find the Terraform files for this module in the directory `[moduleDir]/infra/aws`. You can define multiple deployments for this module, for instance for development, staging and production environments. 

If you configured AWS deployment before downloading your projects, the deployments and their respective configurations are defined in `[moduleDir]/goldstack.json`.

The configuration tool will define one deployment. This will be either `dev` or `prod` depending on your choice during project configuration. In the example `goldstack.json` below, a deployment with the name `dev` is defined.

```json
{
  "$schema": "./schemas/package.schema.json",
  "name": "...",
  "template": "...",
  "templateVersion": "...",
  "configuration": {},
  "deployments": [
    {
      "name": "dev",
      "awsRegion": "us-west-2",
      "awsUser": "awsUser",
      "configuration": {
        ...
      }
    }
  ]
}
```

### Infrastructure Commands

Infrastructure commands for this module can be run using `yarn`. There are four commands in total:

*   `yarn infra up`: For standing up infrastructure.
*   `yarn infra init`: For [initialising Terraform](https://www.terraform.io/docs/commands/init.html).
*   `yarn infra plan`: For running [Terraform plan](https://www.terraform.io/docs/commands/plan.html).
*   `yarn infra apply`: For running [Terraform apply](https://www.terraform.io/docs/commands/apply.html).
*   `yarn infra destroy`: For destroying all infrastructure using [Terraform destroy](https://www.terraform.io/docs/commands/destroy.html).

For each command, the deployment they should be applied to must be specified.

```bash
yarn infra [command] [deploymentName]
```

For instance, to stand up the infrastructure for the `dev` deployment, the following command would need to be issued:

```bash
yarn infra up dev
```

Generally you will only need to run `yarn infra up`. However, if you are familiar with Terraform and want more fine-grained control over the deployment of your infrastructure, you can also use the other commands as required.

### Customizing Terraform

Goldstack modules make it very easy to customize infrastructure to your specific needs. The easiest way to do this is to simply edit the `*.tf` files in the `infra/aws` folder. You can make the changes you need and then run `yarn infra up [deploymentName]` to apply the changes.

The `infra/aws` folder contains a file `variables.tf` that contains the variables required for your deployment; for instance the domain name for a website. The values for these variables are defined in the module's `goldstack.json` file in the `"configuration"` property. There is one global `configuration` property that applies for all deployments and each deployment also has its own `configuration` property. In order to add a new variable, add the variable to `variables.tf` and then add it to the configuration for your module or to the configurations for the deployments.

Note that due to JavaScript and Terraform using different conventions for naming variables, Goldstack applies a basic transformation to variable names. Camel-case variables names are converted to valid variables names for Terraform by replacing every instance of a capital letter `C` with `_c` in the variable name. For instance:

`myVariableName` in the Goldstack configuration will translate to the Terraform variable `my_variable_name` as defined in `variables.tf`.

### Terraform State

In order to manage your infrastructure, Terraform maintains a state for each deployment; to calculate required changes when the infrastructure is updated and also for destroying the infrastructure if it is no longer required. Goldstack by default will store the terraform state in the `infra/aws` folder as simple files.

This works well for deploying infrastructure from your local development environment but is not a good choice when building a CI/CD pipeline for the infrastructure definition. In that case, it is better to define [Remote State](https://www.terraform.io/docs/state/remote.html). A popular choice many projects adopt here is to store the [state in an S3 bucket](https://www.terraform.io/docs/backends/types/s3.html). Please see the Terraform documentation for further details.

## Deployment

This module can be packaged up and deployed to the deployments specified in `goldstack.json`. Note that deployment will only work *after* the infrastructure for the respective deployment has been stood up. To deploy your module, run the following script:

```bash
yarn deploy [deploymentName]
```

## Limitations

Goldstack's Next.js modules enable deploying Next.js applications to a serverless AWS infrastructure. The advantage of this is that you get a very low cost, highly scalable and enterprise ready deployment for the Next.js application. However, serverless AWS infrastructure is structurally different to deployments on Vercel or deployments as stand alone Node.js applications. Thus there are a couple of limitations to keep in mind when working with this template:

*   [API Routes](https://nextjs.org/docs/api-routes/introduction) are not supported. If you need a backend, we recommend adding our [Lambda Express](lambda-express) template to your project.
*   When standing up infrastructure for this module, a new certificate will be automatically obtained from AWS Certificate Manager. AWS has a default limit of the number of SSL certificates per account. If you are reaching this limit, you can simply make a service request with AWS to increase it.
*   Pre-fetching does not work in some situations, for instance when statically rendering pages using `getStaticPaths`. As a workaround, we recommend not using [Link](https://nextjs.org/docs/api-reference/next/link) components for these routes and instead use vanilla `a` elements.
*   Files added to the `public/` folder may not be served correctly. Configure the CloudFront distribution as described [here](#404-not-found-for-files-in-public-folder-1) to make the files available.
*   Delay in deploying new dynamic routes. Since dynamic routes are implemented using Lambda@Edge functions, it can take a while for dynamic routes to start working. This is because once a new dynamic routes is added, a new Lambda@Edge function needs to be deployed. You can check the state of the CloudFront distribution in the AWS console. If no new dynamic routes have been added, everything should work as expected directly after the deployment.
*   Redirect domain configured as CNAME rather than its own bucket and CloudFront distribution due to [this know limitation](https://www.reddit.com/r/aws/comments/7jyisk/https_redirect_on_s3\_bucket_access_denied_error/)
*   No support for a dynamic route and pages in the same directory. When creating both normal pages and a dynamic route in a directory, the dynamic route will always be loaded first. For instance, given the following two files:

<!---->

    [id].tsx
    dummy.tsx

When accessing `/dummy`, `[id.tsx]` will be loaded. This does not apply to the `index.html`, which will still be loaded correctly under the root `/`.

Workaround:

Place dynamic routes into sub directories, such as:

    [id]/index.tsx
    dummy.tsx

There may be other issues in various edge scenarios. If you come across these, [raise an issue](https://github.com/goldstack/goldstack/issues) or contact support.

## Troubleshooting and Frequently Asked Questions

### 404 Not found for files in public folder

Next.js supports static file serving by [placing files into a public/ folder](https://nextjs.org/docs/basic-features/static-file-serving). This is useful for files such as `favicon.ico`. This module by default provides support for `favicon.ico` files but if you want to add other files, these may not be captured by the [CloudFront behaviours configured in Terraform](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/cloudfront_distribution#cache-behavior-arguments).

Next.js may try to resolve these files as dynamic paths, which may result in the files not being found. To fix this, go into `infra/aws/root.tf` and add additional `ordered_cache_behaviours` as required.

For instance, if you want to serve a file `/myfile.png` provided in `public/myfile.png` and this file should be cached in CloudFront, add the following behaviour:

```hcl
  ordered_cache_behavior {
    path_pattern     = "myfile.png"
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD", "OPTIONS"]
    target_origin_id = "origin-bucket-${aws_s3_bucket.website_root.id}"

    forwarded_values {
      query_string = false
      headers      = ["Origin"]

      cookies {
        forward = "none"
      }
    }

    min_ttl                = 0
    default_ttl            = 86400
    max_ttl                = 31536000
    compress               = true
    viewer_protocol_policy = "redirect-to-https"
  }
```

If you would like all files in `/myfolder` provided in the folder `public/myfolder` and not cache these, provide the following behaviour:

```hcl
  ordered_cache_behavior {
    path_pattern     = "myfolder/*"
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD", "OPTIONS"]
    target_origin_id = "origin-bucket-${aws_s3_bucket.website_root.id}"

    forwarded_values {
      query_string = false
      headers      = ["Origin"]

      cookies {
        forward = "none"
      }
    }

    min_ttl                = 0
    default_ttl            = tostring(var.default_cache_duration)
    max_ttl                = 1200
    compress               = true
    viewer_protocol_policy = "redirect-to-https"
  }
```

### '502 ERROR The request could not be satisfied' when opening page

Instead of seeing the page, you may see an error message like the following:

```bash
502 ERROR
The request could not be satisfied.
The Lambda function returned invalid json: The json output must be an object type. We can't connect to the server for this app or website at this time. There might be too much traffic or a configuration error. Try again later, or contact the app or website owner.
If you provide content to customers through CloudFront, you can find steps to troubleshoot and help prevent this error by reviewing the CloudFront documentation.
Generated by cloudfront (CloudFront)
Request ID: JIQQuxOxsXdcyHuUKxbA88YeFs_NH0h7B6xbG-SZFN88byb5WffF0A==
```

This is most likely due to the deployment not having worked correctly. Try deploying the package again with `yarn deploy [deploymentName]`.

### AccessDenied error when setting up infrastructure

When running \`yarn infra up [deploymentName], you may get AccessDenied errors such as the following:

```bash
Error: error getting S3 Bucket CORS configuration: AccessDenied: Access Denied
        status code: 403, request id: 1Z1VFR1N5RAMFZ9W, host id: mYdqmUJ8Vo+t845tuW9NNYF8WVnKxlbynRAir4BoMKHKB5kcFjM3uiGkJpQAHGHxusa6sHzcazs=
```

There are a number of possible causes for this:

*   You may have configured your AWS user incorrectly. Please see [AWS Configuration](./../goldstack/configuration#aws-configuration) for details on how to configure your AWS user.
*   You may accidently have a Terraform state in your module. That can happen if you create new modules by copy and pasting from an existing module. In this case, delete the following two folders in your module: `infra/aws/.terraform` and `infra/aws/terraform.tfstate.d`.

## Security Hardening

Here are a number of ways how the configuration for this module can be changed to enhance security:

*   In `infra/aws/edge.tf` for the `resource "aws_iam_policy" "lambda_logging"` you can further restrict the access rights to write log events: `"Resource": "arn:aws:logs:*:*:*"`.
