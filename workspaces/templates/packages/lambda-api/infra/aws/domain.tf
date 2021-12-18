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

resource "aws_route53_record" "wildcard_validation" {
  name    = aws_acm_certificate.wildcard.domain_validation_options[0].resource_record_name
  type    = aws_acm_certificate.wildcard.domain_validation_options[0].resource_record_type
  zone_id = data.aws_route53_zone.main.zone_id
  records = [aws_acm_certificate.wildcard.domain_validation_options[0].resource_record_value]
  ttl     = "60"
}

# Required to force ACM wildcard certificate validation
resource "aws_acm_certificate_validation" "wildcard_cert" {
  provider = aws.us-east-1

  certificate_arn         = aws_acm_certificate.wildcard.arn
  validation_record_fqdns = [aws_route53_record.wildcard_validation.fqdn]
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