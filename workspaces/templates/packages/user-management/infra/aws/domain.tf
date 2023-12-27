


## Route 53
# Provides details about the zone
data "aws_route53_zone" "main" {
  name         = var.hosted_zone_domain
  private_zone = false
}

## ACM (AWS Certificate Manager)
# Creates the wildcard certificate *.<yourdomain.com>
resource "aws_acm_certificate" "wildcard" {
  provider = aws.us-east-1 # Wilcard certificate used by CloudFront requires this specific region (https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/cnames-and-https-requirements.html)

  domain_name               = var.cognito_domain
  subject_alternative_names = ["*.${var.cognito_domain}"]
  validation_method         = "DNS"

  tags = {
    ManagedBy = "goldstack-terraform"
    Changed   = formatdate("YYYY-MM-DD hh:mm ZZZ", timestamp())
  }

  lifecycle {
    ignore_changes = [tags]
    create_before_destroy = true
  }
}

# see https://renehernandez.io/snippets/terraform-and-aws-wildcard-certificates-validation/
resource "aws_route53_record" "wildcard_validation" {

  for_each = {
    for dvo in aws_acm_certificate.wildcard.domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      record = dvo.resource_record_value
      type   = dvo.resource_record_type
    }
   # Skips the domain if it doesn't contain a wildcard
    if length(regexall("\\*\\..+", dvo.domain_name)) > 0
  }

  allow_overwrite = true
  name            = each.value.name
  records         = [each.value.record]
  ttl             = 60
  type            = each.value.type
  zone_id         = data.aws_route53_zone.main.zone_id
}

resource "aws_route53_record" "auth-cognito-A" {
  name    = aws_cognito_user_pool_domain.main.domain
  type    = "A"
  zone_id = data.aws_route53_zone.main.zone_id
  alias {
    evaluate_target_health = false
    name                   = aws_cognito_user_pool_domain.main.cloudfront_distribution_arn
    # This zone_id is fixed
    zone_id = "Z2FDTNDATAQYW2"
  }
}

# Required to force ACM wildcard certificate validation
# see https://kopi.cloud/blog/2021/terraform-aws_acm_certificate-wildcards/
resource "aws_acm_certificate_validation" "wildcard_validation" {
  provider = aws.us-east-1

  certificate_arn = data.aws_acm_certificate.wildcard.arn

  validation_record_fqdns = concat(
    [
      for record in aws_route53_record.wildcard_validation : record.fqdn
    ],
    [
      for record in aws_route53_record.wildcard_validation : record.fqdn
    ]
  )
}

data "aws_acm_certificate" "wildcard" {
  provider = aws.us-east-1

  depends_on = [
    aws_acm_certificate.wildcard,
    aws_route53_record.wildcard_validation,
  ]

  domain      = var.cognito_domain
  statuses    = ["ISSUED"]
  most_recent = true
}
