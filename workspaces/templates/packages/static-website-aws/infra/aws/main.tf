


## Route 53
# Provides details about the zone
data "aws_route53_zone" "main" {
  name         = var.hosted_zone_domain
  private_zone = false
}

## ACM (AWS Certificate Manager)
# Creates the wildcard certificate *.<yourdomain.com>
resource "aws_acm_certificate" "wildcard_website" {
  provider = aws.us-east-1 # Wilcard certificate used by CloudFront requires this specific region (https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/cnames-and-https-requirements.html)

  domain_name               = var.website_domain
  subject_alternative_names = ["*.${var.website_domain}"]
  validation_method         = "DNS"

  tags = {
    ManagedBy = "goldstack-terraform"
    Changed   = formatdate("YYYY-MM-DD hh:mm ZZZ", timestamp())
  }

  lifecycle {
    ignore_changes        = [tags]
    create_before_destroy = true
  }
}

# Validates the ACM wildcard by creating a Route53 record (as `validation_method` is set to `DNS` in the aws_acm_certificate resource)
# see https://renehernandez.io/snippets/terraform-and-aws-wildcard-certificates-validation/
resource "aws_route53_record" "wildcard_validation" {
  provider = aws.us-east-1
  for_each = {
    for dvo in aws_acm_certificate.wildcard_website.domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      record = dvo.resource_record_value
      type   = dvo.resource_record_type
    }
   # Skips the domain if it doesn't contain a wildcard
    if length(regexall("\\*\\..+", dvo.domain_name)) > 0
  }

  allow_overwrite = true
  name            = each.value.name
  type            = each.value.type
  zone_id         = data.aws_route53_zone.main.zone_id
  records         = [each.value.record]
  ttl             = 60
}


# Required to force ACM wildcard certificate validation
# see https://kopi.cloud/blog/2021/terraform-aws_acm_certificate-wildcards/
resource "aws_acm_certificate_validation" "wildcard_validation" {
  provider = aws.us-east-1
  certificate_arn = data.aws_acm_certificate.wildcard_website.arn

  validation_record_fqdns = concat(
    [
      for record in aws_route53_record.wildcard_validation : record.fqdn
    ],
  )
}

# Introduce a wait for 1 minute using time_sleep
# This may prevent errors like https://github.com/hashicorp/terraform-provider-aws/issues/32309
resource "time_sleep" "wait_for_cert" {
  depends_on = [
    aws_acm_certificate.wildcard_website,
    aws_route53_record.wildcard_validation
  ]

  create_duration = "60s"  # Waits for 60 seconds
}

# Get the ARN of the issued certificate
data "aws_acm_certificate" "wildcard_website" {
  provider = aws.us-east-1

  depends_on = [
    time_sleep.wait_for_cert
  ]

  domain      = var.website_domain
  statuses    = ["ISSUED"]
  most_recent = true
}



