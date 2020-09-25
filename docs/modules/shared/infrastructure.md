All infrastructure for this module is defined in Terraform. You can find the Terraform files for this module in the directory `[moduleDir]/infra/aws`. You can define multiple deployments for this module, for instance for deployment into a development, test and production system. The deployments and their respective configurations are defined in `[moduleDir]/goldstack.json`. When using the Goldstack configuration tool, there will be one deployment defined that is either `dev` or `prod` depending on whether you choose to define your initial infrastructure for a development or production system.

### Infrastructure Commands

There are a number of package scripts defined for working with infrastructure. For all infrastructure scripts, we will need to define which deployment they should apply to for. This is done by referencing the deployment name as configured in `goldstack.json`. The following commands are supported:

```
yarn infra up [deploymentName]
```

Which will run the commands `init`, `plan` and `apply` to stand up the infrastructure in the specified destination. If you are new to Terraform, running `yarn infra up` is the easiest way to get your infrastructure up and running.

However, if you are familiar with Terraform and want more fine-grained control over the deployment of your infrastructure, the following commands are also supported:

```
yarn infra init [deploymentName]
```

Which will run `terraform init` to initialise the deployment.

```
yarn infra plan [deploymentName]
```

Which will run `terraform plan` and show the delta for the infrastructure.

```
yarn infra apply [deploymentName]
```

Which will run `terraform apply` and deploy the infrastructure. This requires `yarn infra plan` to have run successfully before.

```
yarn infra destroy [deploymentName]
```

Which will run `terraform destroy` and **destroy** all your infrastructure. Note that this will lead to loss of all the data you may be storing in datastores for this deployment, so do use this command with caution.

### Customizing Terraform

Goldstack is made to make it very easy to customize the infrastructure to your specific needs. The easiest way to do this is to simply edit the `*.tf` files in the `infra/aws` folder. You can make the changes you need and then run `yarn infra up [deploymentName]` to apply the changes.

The `infra/aws` folder contains a file `variables.tf` that contains the variables required for your deployment; for instance the domain name for a website. The values for these variables are defined in the module's `goldstack.json` file in the `"configuration"` property. There is one global `configuration` property that applies for all deployments and each deployment also has their own `configuration` property. In order to add a new variable, add this variable to `variables.tf` and then add it to the configuration for your module or to the configurations for the deployments.

Note that due to JavaScript and Terraform using different conventions for naming variables, Goldstack applies a basic transformation to variable names. Camel-case variables names are converted in valid variables names for terraform by replacing every instance of a capital letter `C` with `_c` in the variable name. For instance:

`myVariableName` in the Goldstack configuration will translate to the Terraform variable `my_variable_name` as defined in `variables.tf`.

### Terraform State

In order to manage your infrastructure, Terraform maintains a state for each deployment - to be able to calculate required changes when the infrastructure is updated and also to enable to destroy the infrastructure easily if it is no longer required. Goldstack by default will store the terraform state in the `infra/aws` folder as simple files.

This works well for deploying infrastructure from your local development environment but is not a good choice when building a CI/CD pipeline for the infrastructure definition. In that case, it is better to define [Remote State](https://www.terraform.io/docs/state/remote.html). A popular choice many projects adopt here is to store the [state in an S3 bucket](https://www.terraform.io/docs/backends/types/s3.html). Please see the Terraform documentation for further details.
