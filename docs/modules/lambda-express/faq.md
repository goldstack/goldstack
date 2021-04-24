### DNS Name for API Cannot be resolved

After applying `yarn infra up [deployment]` and `yarn deploy [deployment]` it is not possible to call the API at `https://[configuration.apiDomain]`. An error such as `Address cannot be resolved` or `DNSProbe failed` is reported.

This is caused by changes to the deployed DNS hosted zone needing some time to propagate through the DNS network. Wait for 10-30 min and the API should be able to be called without problems. To validate your DNS name has been configured correctly, go to the [AWS Route 53 Console](https://aws.amazon.com/route53/), choose the region you have deployed, and validate there is a correct entry for the hosted zone you have selected. There should be an A entry such as the following:

```
[apiDomain].[hostedZone] A [id].cloudfront.net. 
```