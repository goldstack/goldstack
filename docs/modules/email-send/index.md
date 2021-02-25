---
id: emails-send
title: Email Send
---

[!embed](./about.md)

## Features

[!embed](./features.md)

## Configure

[!embed](./configure.md)

## Getting Started

[!embed](./getting-started.md)

## Infrastructure

[!embed](./../shared/infrastructure.md)

## Features

Setting the environment variable `GOLDSTACK_LOG_EMAILS=true` will log out all emails that are sent when in local development mode. This can be useful when testing an API server locally or when debugging unit tests.

## Troubleshooting

### TXT record already exists

[%Video Walkthrough](https://www.youtube.com/embed/TQlIQkM1wms)

When running `yarn infra up [deployment]` you may receive an error such as the following:

```bash
Error: [ERR]: Error building changeset: InvalidChangeBatch: [Tried to create resource record set [name='yourdomain.com.', type='TXT'] but it already exists]
        status code: 400, request id: xxxx

  on main.tf line 45, in resource "aws_route53_record" "spf_domain":
  45: resource "aws_route53_record" "spf_domain" {
```

This error is reported when a TXT record for your specified domain already exists. Often other services such as G Suite set TXT records that conflict with the TXT record that the Email Send module wants to create.

#### Workaround

The easiest way to circumvent this issue is to do the following:

- Copy the existing TXT record in the Route 53 console and add it to the definition for the TXT record in `infra/aws/main.tf`. Make sure that the record is for the correct record name. For instance, if you want to configure email sending for `yourdomain.com`, the record name would be exactly `yourdomain.com`. The following example shows how we would add a `google-site-verification` declaration.

```bash
resource "aws_route53_record" "spf_mail_from" {
  zone_id = data.aws_route53_zone.main.zone_id
  name    = aws_ses_domain_mail_from.main.mail_from_domain
  type    = "TXT"
  ttl     = "600"
  records = ["v=spf1 include:amazonses.com -all", "google-site-verification=xxx"]
}
```

- Delete the TXT record in the [Route 53 Console](https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/resource-record-sets-deleting.html). Ensure that you have copied the record successfully before deleting it.
- Now run `yarn infra up prod`

## Security Hardening

This module is already developed following best security practices, including various means to ensure good email deliverability by configuring SPF and DKIM. Further improvements to the security for the email module can generally be made by explicitly granting rights to other components of the system that use this module, such as Lambdas. For further details on how to configure access for sending emails via SES, please see [Controlling access to Amazon SES](https://docs.aws.amazon.com/ses/latest/DeveloperGuide/control-user-access.html) in the AWS SES documentation.
