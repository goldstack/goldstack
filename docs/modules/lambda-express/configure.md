The following key properties need to be configured for this module:

- **Lambda Name**: The [name](https://docs.aws.amazon.com/lambda/latest/dg/API_CreateFunction.html#SSS-CreateFunction-request-FunctionName) to be used for this lambda. This needs to be unique per AWS region.
- **API Domain**: The domain where the API should be deployed to. For instance, to be able to call the API endpoint `https://api.mydomain.com/` the API domain `api.mydomain.com` needs to be configured.
- **Hosted Zone Domain**: A Route 53 hosted zone that will allow adding the _API Domain_ as a record. For instance, in order to configure the API domain `api.mydomain.com`, the hosted zones `api.mydomain.com` or `mydomain.com` would be valid. For more details, please check [Providing a Hosted Zone](https://docs.goldstack.party/docs/goldstack/configuration#provide-hosted-zone-1) in the Goldstack documentation.
