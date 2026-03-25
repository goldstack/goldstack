# Creates bucket for forward domain
resource "aws_s3_bucket" "website_redirect" {
  count = var.website_domain_redirect != null ? 1 : 0

  bucket = "${var.website_domain}-redirect"

  # Remove this line if you want to prevent accidental deletion of bucket
  force_destroy = true

  tags = {
    ManagedBy = "terraform"
    Changed   = formatdate("YYYY-MM-DD hh:mm ZZZ", timestamp())
  }

  lifecycle {
    ignore_changes = [tags]
  }
}

resource "aws_s3_bucket_public_access_block" "website_redirect" {
  count = var.website_domain_redirect != null ? 1 : 0

  bucket = aws_s3_bucket.website_redirect[0].id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_ownership_controls" "website_redirect" {
  count = var.website_domain_redirect != null ? 1 : 0

  bucket = aws_s3_bucket.website_redirect[0].id
  rule {
    object_ownership = "BucketOwnerPreferred"
  }
}

resource "aws_s3_bucket_policy" "website_redirect" {
  count = var.website_domain_redirect != null ? 1 : 0

  depends_on = [
    aws_s3_bucket_public_access_block.website_redirect,
    aws_s3_bucket_ownership_controls.website_redirect,
  ]

  bucket = aws_s3_bucket.website_redirect[0].id
  policy = data.aws_iam_policy_document.website_redirect[0].json
}

data "aws_iam_policy_document" "website_redirect" {
  count = var.website_domain_redirect != null ? 1 : 0

  statement {
    principals {
      type        = "Service"
      identifiers = ["cloudfront.amazonaws.com"]
    }

    actions = [
      "s3:GetObject",
    ]

    resources = [
      "${aws_s3_bucket.website_redirect[0].arn}/*",
    ]

    condition {
      test     = "StringEquals"
      variable = "AWS:SourceArn"
      values   = [aws_cloudfront_distribution.website_cdn_redirect[0].arn]
    }
  }
}

resource "aws_cloudfront_origin_access_control" "website_redirect" {
  count = var.website_domain_redirect != null ? 1 : 0

  name                              = "oac-${length(var.website_domain) > 34 ? substr(var.website_domain, 0, 34) : var.website_domain}-redirect-${random_id.oac_suffix.hex}"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

resource "aws_cloudfront_function" "redirect" {
  count = var.website_domain_redirect != null ? 1 : 0

  name    = "redirect-to-${replace(length(var.website_domain) > 48 ? substr(var.website_domain, 0, 48) : var.website_domain, ".", "-")}"
  runtime = "cloudfront-js-1.0"
  publish = true
  code    = <<-EOF
    function handler(event) {
      var response = {
        statusCode: 301,
        statusDescription: 'Moved Permanently',
        headers: { location: { value: 'https://${var.website_domain}' + event.request.uri } }
      };
      return response;
    }
  EOF
}

# CloudFront for redirect (to support https://)
resource "aws_cloudfront_distribution" "website_cdn_redirect" {
  count = var.website_domain_redirect != null ? 1 : 0

  depends_on = [
  ]
  enabled     = true
  price_class = "PriceClass_All" # Select the correct PriceClass depending on who the CDN is supposed to serve (https://docs.aws.amazon.com/AmazonCloudFront/ladev/DeveloperGuide/PriceClass.html)
  aliases     = [var.website_domain_redirect]
  provider    = aws.us-east-1

  origin {
    origin_id                = "origin-bucket-${aws_s3_bucket.website_redirect[0].id}"
    domain_name              = aws_s3_bucket.website_redirect[0].bucket_regional_domain_name
    origin_access_control_id = aws_cloudfront_origin_access_control.website_redirect[0].id
  }

  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT", "DELETE"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "origin-bucket-${aws_s3_bucket.website_redirect[0].id}"

    viewer_protocol_policy   = "redirect-to-https" # Redirects any HTTP request to HTTPS
    compress                 = true
    cache_policy_id          = "4135ea2d-6df8-44a3-9df3-4b5a84be39ad" # CachingDisabled
    origin_request_policy_id = "88a5eaf4-2fd4-4709-b370-b4c650ea3fcf" # CORS-S3Origin

    function_association {
      event_type   = "viewer-request"
      function_arn = aws_cloudfront_function.redirect[0].arn
    }
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    acm_certificate_arn = data.aws_acm_certificate.wildcard_website.arn
    ssl_support_method  = "sni-only"
  }

  tags = {
    ManagedBy = "terraform"
    Changed   = formatdate("YYYY-MM-DD hh:mm ZZZ", timestamp())
  }

  lifecycle {
    ignore_changes = [
      tags,
      viewer_certificate,
    ]
  }
}

# Creates record to point to redirect CloudFront distribution
resource "aws_route53_record" "website_cdn_redirect_record" {
  count = var.website_domain_redirect != null ? 1 : 0

  zone_id = data.aws_route53_zone.main.zone_id
  name    = var.website_domain_redirect
  type    = "A"

  alias {
    name                   = aws_cloudfront_distribution.website_cdn_redirect[0].domain_name
    zone_id                = aws_cloudfront_distribution.website_cdn_redirect[0].hosted_zone_id
    evaluate_target_health = false
  }
}