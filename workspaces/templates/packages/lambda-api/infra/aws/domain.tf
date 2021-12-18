## Route 53
# Provides details about the zone
data "aws_route53_zone" "main" {
  name         = var.hosted_zone_domain
  private_zone = false
}

## ACM (AWS Certificate Manager)
# Creates the wildcard certificate *.<yourdomain.com>
resource "aws_acm_certificate" "wildcard" {
  provider = aws.us-east-1 

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
  ttl     = "120"
}

resource aws_route53_record a {
  type     = "A"
  name     = var.api_domain
  ttl      = "120"
  zone_id  = data.aws_route53_zone.main.zone_id

  alias {
    evaluate_target_health = false
    name                   = aws_apigatewayv2_domain_name.api.domain_name_configuration[0].target_domain_name
    zone_id                = aws_apigatewayv2_domain_name.api.domain_name_configuration[0].hosted_zone_id
  }
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


resource "aws_apigatewayv2_domain_name" "domain" {
  domain_name = var.api_domain

  domain_name_configuration {
    certificate_arn = data.aws_acm_certificate.wildcard.arn
    endpoint_type   = "REGIONAL"
    security_policy = "TLS_1_2"
  }
}

resource "aws_apigatewayv2_api_mapping" "mapping" {
  api_id      = aws_apigatewayv2_api.api.id
  domain_name = aws_apigatewayv2_domain_name.api.id
  stage       = aws_apigatewayv2_stage.api.id
}

