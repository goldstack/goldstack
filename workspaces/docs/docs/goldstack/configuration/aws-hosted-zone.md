[%Video Guide](https://www.youtube.com/embed/9rug-hhkxSc)

Many modules need to deploy resources to a domain, for instance for a [static website](./../modules/static-website-aws) or for an [API server](./../modules/lambda-express). Goldstack modules can provide the DNS configuration required but you need to specify the [Route 53 hosted zone](https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/AboutHZWorkingWith.html) that the DNS entries should be added to. You can either use an already existing hosted zone or create a new one.

### Creating a new hosted zone

The following steps describe how to create a new hosted zone in AWS Route 53.

- (Optional) If you haven't registered a domain, you can [register a domain through Route 53](https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/domain-register.html).
- Go to the [Route 53 AWS console](https://console.aws.amazon.com/route53/v2/hostedzones#)
- Click on _Create Hosted Zone_

![Create hosted zone](https://cdn.goldstack.party/img/202010/create_hosted_zone.png)

- Provide the name of a domain you own (or a subdomain of a domain you own) and click _Create hosted zone_.

![Provide hosted zone details](https://cdn.goldstack.party/img/202010/hosted_zone_details.png)

- If you haven't registered your domain through Route 53, configure your domain with your domain registrar to use the nameservers Route 53 lists for your domain.

![Provide hosted zone details](https://cdn.goldstack.party/img/202010/nameservers.png)

Now you can copy the domain name of your hosted zone and provide this in your module configuration

![Domain name to be used for module configuration](https://cdn.goldstack.party/img/202010/domainname.png)

Note that for the actual domain your module uses, you can specify the domain name of the hosted zone directly, or one of it's subdomains. For instance, if your hosted zone domain is `yourdomain.com` you can configure a website module to be deployed to `yourdomain.com` or `website.yourdomain.com`.

You can use the same hosted zone for multiple modules. Just make sure to use subdomains to avoid conflicts between modules. For instance, if you configure a website to be deployed to `mydomain.com` then deploy your API to `api.mydomain.com`.

### Using an existing hosted zone

If you already have a hosted zone configured for the domain you would like to use for your module, you simply need to provide the domain of the hosted zone.

- You can find all hosted zones you have configured in the [Route 53 Console](https://console.aws.amazon.com/route53/v2/hostedzones#)
- Copy the value provided under _Domain name_ and provide this in your module configuration

![Determining domain name from hosted zone list](https://cdn.goldstack.party/img/202010/domainname_list.png)
