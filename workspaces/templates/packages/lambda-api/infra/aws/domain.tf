## Route 53
# Provides details about the zone
data "aws_route53_zone" "main" {
  name         = var.hosted_zone_domain
  private_zone = false
}

## ACM (AWS Certificate Manager)
# Creates the wildcard certificate *.<yourdomain.com>
resource "aws_acm_certificate" "wildcard" {

  domain_name               = var.api_domain
  subject_alternative_names = ["*.${var.api_domain}"]
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


resource aws_route53_record a {
  type     = "A"
  name     = var.api_domain
  zone_id  = data.aws_route53_zone.main.zone_id

  alias {
    evaluate_target_health = false
    name                   = aws_apigatewayv2_domain_name.domain.domain_name_configuration[0].target_domain_name
    zone_id                = aws_apigatewayv2_domain_name.domain.domain_name_configuration[0].hosted_zone_id
  }
}


# Required to force ACM wildcard certificate validation
# see https://kopi.cloud/blog/2021/terraform-aws_acm_certificate-wildcards/
resource "aws_acm_certificate_validation" "wildcard_validation" {
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

  depends_on = [
    aws_acm_certificate.wildcard,
    aws_route53_record.wildcard_validation,
    aws_acm_certificate_validation.wildcard_validation,
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
  domain_name = aws_apigatewayv2_domain_name.domain.id
  stage       = aws_apigatewayv2_stage.default.id
}

