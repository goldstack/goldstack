The following key properties need to be configured for this template:

- **Domain**: The domain that emails will be sent from. The Email Send template will support sending emails from any possible email address in your chosen domain. For instance, if the domain `mydomain.com` is chosen, email addresses such as `support@mydomain.com`, `noreply@mydomain.com` and `system@mydomain.com` are supported.
- **Hosted Zone Domain**: A Route 53 hosted zone that will allow adding the _Domain_ as a record. For instance, in order to configure the domain `mydomain.com`, the hosted zone `mydomain.com` would be valid. For more details, please check [Hosted Zone Configuration](https://docs.goldstack.party/docs/goldstack/configuration#hosted-zone-configuration) in the Goldstack documentation.
