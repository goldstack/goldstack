
Error reported by Terraform:

```
Error: Error requesting certificate: LimitExceededException: Error: you have reached your limit of 20 certificates in the last year.
```

Fix by:

- Making a request to increase the AWS service limit for 'ACM certificates created in last 365 days': https://console.aws.amazon.com/servicequotas/home?region=us-east-1#!/services/acm/quotas/L-DA1D8B98. Make sure you do this in the correct region.

Comments:

- It appears that the default limit is displayed as '2000'. However, it seems AWS internally may set this limit to a lower value. See [Docs should warn about ACM yearly certificate limit
](https://github.com/aws/aws-cdk/issues/5889).