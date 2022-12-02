
### Error 'Custom domain is not a valid subdomain'

When running `yarn infra up` the following error may be issued by Terraform:

```
 Error: Error creating Cognito User Pool Domain: InvalidParameterException: Custom domain is not a valid subdomain: Was not able to resolve the root domain, please ensure an A record exists for the root domain.
```

This error is caused by Cognito [requiring that the parent domain of a specified domain has an A record](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-pools-add-custom-domain.html). So for instance, if you specify the cognito domain `auth.examples.mydomain.com`, then this error will occur if there is no A record defined for `examples.mydomain.com`.