# User Management Template

❤️ Support development by using the [Goldstack Project Builder](https://goldstack.party) ❤️

The user management template provides the infrastructure and utility libraries for authenticating users using [Amazon Cognito](https://aws.amazon.com/cognito/).

## Features

*   Provides all Terraform resources requires for setting up an identity server using Amazon Cognito.
*   Provides customisable UI for signing up and signing in users.
*   Library with convenient methods to authenticate user on the client.
*   Library to validate tokens on the server.
*   Automatically verifies users email addresses.

## Configure

The following key properties need to be configured for this template:

*   **Cognito Domain**: The domain on which the identity server and the UI pages for login will be hosted.
*   **User Pool Name**: The name for the Cognito User Pool that should be created by this template. Note no User Pool of the same name should exist in your account.
*   **Callback URL**: A URL pointing to a page in your applications that users should be redirected after signing in successfully through the Cognito UI.
*   **Hosted Zone Domain**: A Route 53 hosted zone to which the *Cognito Domain* an be added as record. For instance, the hosted zone domain `mysite.com` would allow adding the cognito domain `auth.mysite.com`. For more details, please check [Hosted Zone Configuration](https://docs.goldstack.party/docs/goldstack/configuration#hosted-zone-configuration) in the Goldstack documentation.

## Getting Started

### 1. Project Setup

Before using this template, you need to configure the project. For this, please see the [Getting Started Guide](https://docs.goldstack.party/docs/goldstack/getting-started) on the Goldstack documentation.

### 2. Setup Infrastructure

To stand up the infrastructure for this module, find the directory for this module in the `packages/` folder and navigate to this folder in the command line. Then identify the name of the deployment you have defined in the Goldstack configuration tool. This can be found in the `packages/[moduleName]/goldstack.json` file. Look for the `"deployments"` property and there for the `"name"` of the first deployment. The name should either be `dev` or `prod`.

In order to stand up the infrastructure, run the following command:

```bash
yarn infra up [deploymentName]
```

This will be either `yarn infra up dev` or `yarn infra up prod` depending on your choice of deployment. Note that running this command can take a while.

Note you will want to combine this template with another template to host a UI and provide a web server. We recommend to use the [react-ssr template](https://goldstack.party/templates/server-side-rendering).

### 3. Development (Client)

This template will be most useful when combined with a templates that provide a user interface and API. For any UI and API modules in your project that require authentication, add the `user-management` package to their dependencies:

    yarn add user-management

In UI modules, you can use the `loginWithRedirect` method to force user authentication and obtain the access and id tokens for the user:

```typescript
import {
  getLoggedInUser,
  handleRedirectCallback,
  loginWithRedirect,
} from 'user-management';

const Index = (props: { message: string }): JSX.Element => {
  const user = getLoggedInUser();
  handleRedirectCallback();
  return (
    <>
      {!user && (
        <button
          onClick={() => {
            loginWithRedirect();
          }}
        >
          Login
        </button>
      )}
    </>
  );
};
```

`loginWithRedirect` will redirect the user to the sign in page if required. The method `handleRedirectCallback` will automatically obtain the access and id token and set the cookies `goldstack_access_token` and `goldstack_id_token` that will be included in all server requests.

Authentication also involves requesting a refresh token. The refresh token will be kept in an in-memory variable and will be used to require a new access and id token if the existing ones are expired.

Note during the sign in process, the user will always be redirected to the callback URL you specified during configuration after a successful sign in.

The library also supports logging out users. For this, simply call the method `performLogout`. The user will be redirected to the Cognito hosted UI sign in screen.

```typescript
import { performLogout } from '@goldstack/user-management';

async function logoutUser() {
  await performLogout();
}
```

### 4. Development (Server)

If you want to validate if calls to an API have been made by authenticated users, add the `user-management` module to the dependencies of the server-side module:

    yarn add user-management

On the server, we can validate the tokens send by the client using the `connectWithCognito` method:

For full example, see [SSR Example](https://github.com/goldstack/cognito-react-nodejs-example/blob/master/packages/server-side-rendering/src/routes/%24index.tsx#L124)

```typescript
import { connectWithCognito } from 'user-management';

export const handler: SSRHandler = async (event, context) => {
  const cookies = getCookies((event.cookies || []).join(';'));
  if (cookies.goldstack_access_token) {
    const cognito = await connectWithCognito();
    await cognito.validate(cookies.goldstack_access_token);
    const idToken = await cognito.validateIdToken(cookies.goldstack_id_token);
    message = `Hello ${idToken.email}<br>`;
  }
};
```

Note that it is recommended we [always](https://auth0.com/blog/id-token-access-token-what-is-the-difference/) validate the *access token*. We validate the *id token* in the above as well to determine the user's email address, since the access token only contains the *username*, which in our case is a cognito generated id.

This template is not designed to support authorization. If you have authorization needs, consider implementing this with [DynamoDB](https://build.diligent.com/fast-authorization-with-dynamodb-cd1f133437e3) using the [DynamoDB template](https://goldstack.party/templates/dynamodb).

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

*   `yarn infra up`: For standing up infrastructure.
*   `yarn infra init`: For [initialising Terraform](https://www.terraform.io/docs/commands/init.html).
*   `yarn infra plan`: For running [Terraform plan](https://www.terraform.io/docs/commands/plan.html).
*   `yarn infra apply`: For running [Terraform apply](https://www.terraform.io/docs/commands/apply.html).
*   `yarn infra destroy`: For destroying all infrastructure using [Terraform destroy](https://www.terraform.io/docs/commands/destroy.html).
*   `yarn infra upgrade`: For upgrading the Terraform versions (supported by the template). To upgrade to an arbitrary version, use `yarn infra terraform`.
*   `yarn infra terraform`: For running arbitrary [Terraform commands](https://www.terraform.io/cli/commands).

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

## Security Hardening

Secure user authentication is not easy to achieve. This template contains a few trade-offs that make it easier to get started with developing your application but introduce potential security issues. Key trade-offs are:

### Cookies for Access and Id Token

Access and ID tokens are stored in cookies that are not Http Only when using the `performClientAuth` method. To avoid having cookies stored, use the `getToken` method instead and manage your own cookie persistence.

### No Two Factor Authentication

Two factor authentication is the de facto standard for most serious applications. Cognito is configured in this template without two factor authentication enabled. You can modify the Cognito Terraform configuration to enable two factor authentication.

## FAQ

### Error 'Custom domain is not a valid subdomain'

When running `yarn infra up` the following error may be issued by Terraform:

     Error: Error creating Cognito User Pool Domain: InvalidParameterException: Custom domain is not a valid subdomain: Was not able to resolve the root domain, please ensure an A record exists for the root domain.

This error is caused by Cognito [requiring that the parent domain of a specified domain has an A record](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-pools-add-custom-domain.html). So for instance, if you specify the cognito domain `auth.examples.mydomain.com`, then this error will occur if there is no A record defined for `examples.mydomain.com`.
