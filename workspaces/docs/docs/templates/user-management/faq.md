### Error 'Custom domain is not a valid subdomain'

When running `yarn infra up` the following error may be issued by Terraform:

```
 Error: Error creating Cognito User Pool Domain: InvalidParameterException: Custom domain is not a valid subdomain: Was not able to resolve the root domain, please ensure an A record exists for the root domain.
```

This error is caused by Cognito [requiring that the parent domain of a specified domain has an A record](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-pools-add-custom-domain.html). So for instance, if you specify the cognito domain `auth.examples.mydomain.com`, then this error will occur if there is no A record defined for `examples.mydomain.com`.

### Error 'Updating Cognito User Pool: cannot modify or remove schema items'

This error is issued by Terraform if trying to change an attribute for the user pool
(see [cognito-user-pool](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/cognito_user_pool#schema) Terraform documentation).

```
Error: updating Cognito User Pool (us-west-xxx): cannot modify or remove schema items

with aws_cognito_user_pool.pool,
on main.tf line 1, in resource "aws_cognito_user_pool" "pool":
1: resource "aws_cognito_user_pool" "pool" {

```

You can change the lifecycle configuration in `main.tf` to ignore schema changes as well.

Otherwise you will have to delete and recreate the user pool but DO SO WITH CAUTION since all
your existing user data will be irrecoverably lost, including the passwords your users have set.
