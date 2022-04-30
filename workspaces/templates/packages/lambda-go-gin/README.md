# Lambda Go Gin Template

❤️ Support development by using the [Goldstack Project Builder](https://goldstack.party) ❤️

The Lambda Go Gin template allows developing a lambda using [Go](https://golang.org) and the [Gin](https://github.com/gin-gonic/gin) web server framework. This template will also set up an API Gateway to forward requests to the lambda.

## Features

- Develop a backend server using [Go](https://golang.org) and [Gin](https://github.com/gin-gonic/gin)
- Serverless infrastructure defined in Terraform. Including API Gateway configuration
- Fully automated deployment supported

## Configure

The following key properties need to be configured for this template:

- **Lambda Name**: The [name](https://docs.aws.amazon.com/lambda/latest/dg/API_CreateFunction.html#SSS-CreateFunction-request-FunctionName) to be used for this lambda. Lambda names need to be unique for the AWS Region. It is not possible to have two lambdas with the same name in the same region.
- **API Domain**: The domain where the API should be deployed to. For instance, to be able to call the API endpoint `https://api.mydomain.com/` the API domain `api.mydomain.com` needs to be configured.
- **Hosted Zone Domain**: A Route 53 hosted zone that will allow adding the _API Domain_ as a record. For instance, in order to configure the API domain `api.mydomain.com`, the hosted zones `api.mydomain.com` or `mydomain.com` would be valid. For more details, please check [Hosted Zone Configuration](https://docs.goldstack.party/docs/goldstack/configuration#hosted-zone-configuration) in the Goldstack documentation.
- **CORS Header**: An optional CORS header to enable a UI that is hosted on a different domain to access this API. For instance, for a UI that is deployed to the domain `ui.mydomain.com` the CORS header `https://ui.mydomain.com` should be supplied. To learn more about CORS, see the [Cross-Origin Resource Sharing (CORS)](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS) in the MDN docs.

## Getting Started

This template will only work when the [Go](https://golang.org) executable is installed and available as local executable in the user path. For instructions of how to install the Go executable, please see [golang.org/doc/install](https://golang.org/doc/install).

Note that for automating the build and rolling out the infrastructure, this template will use [Yarn](https://yarnpkg.com/).

### 1. Project Setup

Before using this template, you need to configure the project. For this, please see the [Getting Started Guide](https://docs.goldstack.party/docs/goldstack/getting-started) on the Goldstack documentation.

### 2. Setup Infrastructure

To stand up the infrastructure for this module, find the directory for this module in the `packages/` folder and navigate to this folder in the command line. Then identify the name of the deployment you have defined in the Goldstack configuration tool. This can be found in the `packages/[moduleName]/goldstack.json` file. Look for the `"deployments"` property and there for the `"name"` of the first deployment. The name should either be `dev` or `prod`.

In order to stand up the infrastructure, run the following command:

```bash
yarn infra up [deploymentName]
```

This will be either `yarn infra up dev` or `yarn infra up prod` depending on your choice of deployment. Note that running this command can take a while.

### 3. Deploy Application

Once the infrastructure is successfully set up in AWS using `yarn infra up`, we can deploy the module. For this, simply run the following command:

```bash
yarn deploy [deploymentName]
```

This will either be `yarn deploy dev` or `yarn deploy prod` depending on your choice of deployment during project configuration.

You should now be able to access your API. The domain under which the API is deployed is configured in `goldstack.json` under `"deployments[*].apiDomain"`. You can access this API domain with a browser since the default API provided in the template allows for GET requests to the root.

### Go Development

The easiest way to work with you Go project is by using VSCode. You will need the [golang.go](https://marketplace.visualstudio.com/items?itemName=golang.Go) extension installed. But note that because of a limitation in this extension as of this writing, VSCode must be opened for the folder that contains the Go project. For this go to `File > Open Folder ...` and select the folder of the Go project under the `packages/` directory in the project. For instance `packages/lambda-go-gin`.

### Extending the API

The lambda exposes a REST API using the [Gin](https://github.com/gin-gonic/gin). The server is defined in the file `server.go`. Simply define additional routes or middleware there. For this, please refer to the Gin documentation.

```go
package main

import (
	"os"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func CreateServer() *gin.Engine {
	r := gin.Default()

	corsEnv := os.Getenv("CORS")
	if corsEnv != "" {
		config := cors.DefaultConfig()
		config.AllowOrigins = []string{corsEnv}
		r.Use(cors.New(config))
	}
	r.GET("/status", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status": "ok",
		})
	})
	return r
}
```

## Infrastructure

All infrastructure for this module is defined in Terraform. You can find the Terraform files for this template in the directory `[moduleDir]/infra/aws`. You can define multiple deployments for this template, for instance for development, staging and production environments.

If you configured AWS deployment before downloading your project, the deployments and their respective configurations are defined in `[moduleDir]/goldstack.json`.

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

Infrastructure commands for this template can be run using `yarn`. There are four commands in total:

- `yarn infra up`: For standing up infrastructure.
- `yarn infra init`: For [initialising Terraform](https://www.terraform.io/docs/commands/init.html).
- `yarn infra plan`: For running [Terraform plan](https://www.terraform.io/docs/commands/plan.html).
- `yarn infra apply`: For running [Terraform apply](https://www.terraform.io/docs/commands/apply.html).
- `yarn infra destroy`: For destroying all infrastructure using [Terraform destroy](https://www.terraform.io/docs/commands/destroy.html).
- `yarn infra upgrade`: For upgrading the Terraform versions (supported by the template). To upgrade to an arbitrary version, use `yarn infra terraform`.
- `yarn infra terraform`: For running arbitrary [Terraform commands](https://www.terraform.io/cli/commands).

For each command, the deployment they should be applied to must be specified.

```bash
yarn infra [command] [deploymentName]
```

For instance, to stand up the infrastructure for the `dev` deployment, the following command would need to be issued:

```bash
yarn infra up dev
```

Generally you will only need to run `yarn infra up`. However, if you are familiar with Terraform and want more fine-grained control over the deployment of your infrastructure, you can also use the other commands as required.

Note that for running `yarn infra terraform`, you will need to specify which command line arguments you want to provide to Terraform. By default, no extra arguments are provided:

```bash
yarn infra terraform [deployment] plan
```

If extra arguments are needed, such as variables, you can use the `--inject-variables` option, such as for running `terraform plan`:

```bash
yarn infra terraform [deployment] --inject-variables plan
```

If you want to interact with the remote backend, you can also provide the `--inject-backend-config` option, such as for running `terraform init`:

```bash
yarn infra terraform [deployment] --inject-backend-config init
```

### Customizing Terraform

Goldstack templates make it very easy to customize infrastructure to your specific needs. The easiest way to do this is to simply edit the `*.tf` files in the `infra/aws` folder. You can make the changes you need and then run `yarn infra up [deploymentName]` to apply the changes.

The `infra/aws` folder contains a file `variables.tf` that contains the variables required for your deployment; for instance the domain name for a website. The values for these variables are defined in the module's `goldstack.json` file in the `"configuration"` property. There is one global `configuration` property that applies for all deployments and each deployment also has its own `configuration` property. In order to add a new variable, add the variable to `variables.tf` and then add it to the configuration for your template or to the configurations for the deployments.

Note that due to JavaScript and Terraform using different conventions for naming variables, Goldstack applies a basic transformation to variable names. Camel-case variables names are converted to valid variables names for Terraform by replacing every instance of a capital letter `C` with `_c` in the variable name. For instance:

`myVariableName` in the Goldstack configuration will translate to the Terraform variable `my_variable_name` as defined in `variables.tf`.

### Terraform State

In order to manage your infrastructure, Terraform maintains a state for each deployment; to calculate required changes when the infrastructure is updated and also for destroying the infrastructure if it is no longer required. Goldstack by default will store the terraform state in the `infra/aws` folder as simple files.

This works well for deploying infrastructure from your local development environment but is not a good choice when building a CI/CD pipeline for the infrastructure definition. In that case, it is better to define [Remote State](https://www.terraform.io/docs/state/remote.html). A popular choice many projects adopt here is to store the [state in an S3 bucket](https://www.terraform.io/docs/backends/types/s3.html). Please see the Terraform documentation for further details.

## Deployment

This template can be packaged up and deployed to the deployments specified in `goldstack.json`. Note that deployment will only work _after_ the infrastructure for the respective deployment has been stood up. To deploy your package, run the following script:

```bash
yarn deploy [deploymentName]
```

## Troubleshooting and Frequently Asked Questions

### DNS Name for API Cannot be resolved

After applying `yarn infra up [deployment]` and `yarn deploy [deployment]` it is not possible to call the API at `https://[configuration.apiDomain]`. An error such as `Address cannot be resolved` or `DNSProbe failed` is reported.

This is caused by changes to the deployed DNS hosted zone needing some time to propagate through the DNS network. Wait for 10-30 min and the API should be able to be called without problems. To validate your DNS name has been configured correctly, go to the [AWS Route 53 Console](https://aws.amazon.com/route53/), choose the region you have deployed, and validate there is a correct entry for the hosted zone you have selected. There should be an A entry such as the following:

    [apiDomain].[hostedZone] A [id].cloudfront.net.
