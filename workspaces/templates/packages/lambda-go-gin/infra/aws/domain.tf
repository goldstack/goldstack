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

  domain_name               = var.api_domain
  subject_alternative_names = ["*.${var.api_domain}"]
  validation_method         = "DNS"

  tags = {
    ManagedBy = "goldstack-terraform"
    Changed   = formatdate("YYYY-MM-DD hh:mm ZZZ", timestamp())
  }

  lifecycle {
    ignore_changes = [tags]
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

# Required to force ACM wildcard certificate validation
resource "aws_acm_certificate_validation" "wildcard_cert" {
  provider = aws.us-east-1
  certificate_arn = aws_acm_certificate.wildcard.arn

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
    aws_acm_certificate_validation.wildcard_cert,
  ]

  domain      = var.api_domain
  statuses    = ["ISSUED"]
  most_recent = true
}

resource aws_api_gateway_domain_name domain {
  domain_name     = var.api_domain
  certificate_arn = data.aws_acm_certificate.wildcard.arn

}

resource aws_api_gateway_base_path_mapping base_path {
  api_id      = aws_api_gateway_rest_api.main.id
  domain_name = aws_api_gateway_domain_name.domain.domain_name
  stage_name  = aws_api_gateway_deployment.main.stage_name 
}

resource aws_route53_record a {
  type     = "A"
  name     = aws_api_gateway_domain_name.domain.domain_name
  zone_id  = data.aws_route53_zone.main.zone_id

  alias {
    evaluate_target_health = false
    name                   = aws_api_gateway_domain_name.domain.cloudfront_domain_name
    zone_id                = aws_api_gateway_domain_name.domain.cloudfront_zone_id
  }
}