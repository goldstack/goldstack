Secure user authentication is not easy to achieve. This template contains a few trade-offs that make it easier to get started with developing your application but introduce potential security issues. Key trade-offs are:

### Deletion Protection

It is strongly recommended to enable deletion protection for your Cognito User Pool to prevent accidental deletion. This can be configured by setting `deletionProtection: true` in your deployment configuration in `goldstack.json`. Note that you must disable this protection before you can delete the user pool.

### Cookies for Access and Id Token

Access and ID tokens are stored in cookies that are not Http Only when using the `performClientAuth` method. To avoid having cookies stored, use the `getToken` method instead and manage your own cookie persistence.

### No Two Factor Authentication

Two factor authentication is the de facto standard for most serious applications. Cognito is configured in this template without two factor authentication enabled. You can modify the Cognito Terraform configuration to enable two factor authentication.
