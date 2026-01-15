# Creates bucket to store the static website
resource "aws_s3_bucket" "website_root" {
  bucket = "${var.website_domain}-root"

  # Remove this line if you want to prevent accidential deletion of bucket
  force_destroy = true

  tags = {
    ManagedBy = "terraform"
    Changed   = formatdate("YYYY-MM-DD hh:mm ZZZ", timestamp())
  }

  lifecycle {
    ignore_changes = [tags]
  }
}

resource "aws_s3_bucket_website_configuration" "website_root" {
  bucket = aws_s3_bucket.website_root.id

  index_document {
    suffix = "index.html"
  }

  error_document {
    key = "404.html"
  }
}

resource "aws_s3_bucket_public_access_block" "website_root" {
  bucket = aws_s3_bucket.website_root.id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

resource "aws_s3_bucket_ownership_controls" "website_root" {
  bucket = aws_s3_bucket.website_root.id
  rule {
    object_ownership = "BucketOwnerPreferred"
  }
}

resource "aws_s3_bucket_acl" "website_root" {
  depends_on = [
	  aws_s3_bucket_public_access_block.website_root,
	  aws_s3_bucket_ownership_controls.website_root,
  ]

  bucket = aws_s3_bucket.website_root.id
  acl    = "public-read"

}

resource "aws_s3_bucket_policy" "website_root" {
  bucket = aws_s3_bucket.website_root.id

  depends_on = [
	  aws_s3_bucket_public_access_block.website_root,
	  aws_s3_bucket_ownership_controls.website_root,
  ]

  policy = data.aws_iam_policy_document.website_root.json
}

data "aws_iam_policy_document" "website_root" {
  statement {
    principals {
      type        = "AWS"
      identifiers = ["*"]
    }

    actions = [
      "s3:GetObject",
    ]

    resources = [
      "arn:aws:s3:::${var.website_domain}-root/*"
    ]
  }
}

resource "aws_cloudfront_cache_policy" "static_immutable" {
  name        = "${replace(var.website_domain, ".", "-")}-static-immutable"
  min_ttl     = 0
  default_ttl = 86400
  max_ttl     = 31536000

  parameters_in_cache_key_and_forwarded_to_origin {
    cookies_config { cookie_behavior = "none" }
    headers_config { header_behavior = "none" }
    query_strings_config { query_string_behavior = "none" }
    enable_accept_encoding_gzip   = true
    enable_accept_encoding_brotli = true
  }
}

resource "aws_cloudfront_cache_policy" "default_short" {
  name        = "${replace(var.website_domain, ".", "-")}-default-short"
  min_ttl     = 0
  default_ttl = var.default_cache_duration
  max_ttl     = 1200

  parameters_in_cache_key_and_forwarded_to_origin {
    cookies_config { cookie_behavior = "none" }
    headers_config { header_behavior = "none" }
    query_strings_config { query_string_behavior = "none" }
    enable_accept_encoding_gzip   = true
    enable_accept_encoding_brotli = true
  }
}

resource "aws_cloudfront_origin_request_policy" "cors" {
  name = "${replace(var.website_domain, ".", "-")}-cors"

  cookies_config { cookie_behavior = "none" }
  headers_config {
    header_behavior = "whitelist"
    headers { items = ["Origin"] }
  }
  query_strings_config { query_string_behavior = "none" }
}

resource "aws_cloudfront_function" "routing" {
  name    = "${replace(var.website_domain, ".", "-")}-routing"
  runtime = "cloudfront-js-2.0"
  code    = var.routing_function_code
  comment = "Next.js routing function"

  lifecycle {
    ignore_changes = [code]
  }
}

# Creates the CloudFront distribution to serve the static website
resource "aws_cloudfront_distribution" "website_cdn_root" {
  enabled     = true
  price_class = "PriceClass_All" 
  aliases     = [var.website_domain]
  provider    = aws.us-east-1

  depends_on = [
  ]

  origin {
    domain_name = aws_s3_bucket_website_configuration.website_root.website_endpoint

    origin_id   = "origin-bucket-${aws_s3_bucket.website_root.id}"

    custom_origin_config {
      http_port = 80
      https_port = 443
      origin_protocol_policy = "http-only"
      origin_ssl_protocols = ["TLSv1.2"]
    }
  }

  default_root_object = "index.html"


  # Priority 0
  ordered_cache_behavior {
    path_pattern     = "_next/static/*"
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD", "OPTIONS"]
    target_origin_id = "origin-bucket-${aws_s3_bucket.website_root.id}"

    response_headers_policy_id = aws_cloudfront_response_headers_policy.security_headers_policy.id
    cache_policy_id          = aws_cloudfront_cache_policy.static_immutable.id
    origin_request_policy_id = aws_cloudfront_origin_request_policy.cors.id
    compress               = true
    viewer_protocol_policy = "redirect-to-https"
  }

  # Priority 1
  # Behaviour bypassing edge lambda
  # Path pattern can be changed to '*' here if no dynamic routes are used
  # This will result in a slight performance increase and decreased costs
  ordered_cache_behavior {
    path_pattern     = "index.html"
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD", "OPTIONS"]
    target_origin_id = "origin-bucket-${aws_s3_bucket.website_root.id}"

    response_headers_policy_id = aws_cloudfront_response_headers_policy.security_headers_policy.id
    cache_policy_id          = aws_cloudfront_cache_policy.default_short.id
    origin_request_policy_id = aws_cloudfront_origin_request_policy.cors.id
    compress               = true
    viewer_protocol_policy = "redirect-to-https"
  }

  # Priority 2
  # Using CloudFront function to handle dynamic paths
  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "origin-bucket-${aws_s3_bucket.website_root.id}"

    viewer_protocol_policy = "redirect-to-https"
    response_headers_policy_id = aws_cloudfront_response_headers_policy.security_headers_policy.id
    compress               = true
    cache_policy_id          = aws_cloudfront_cache_policy.default_short.id

    function_association {
      event_type   = "viewer-request"
      function_arn = aws_cloudfront_function.routing.arn
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

  custom_error_response {
    error_caching_min_ttl = 60
    error_code            = 404
    response_page_path    = "/404.html"
    response_code         = 404
  }

  tags = {
    ManagedBy = "terraform"
    Changed   = formatdate("YYYY-MM-DD hh:mm ZZZ", timestamp())
  }

  lifecycle {
    ignore_changes = [
      tags,
      viewer_certificate,
      # Ignoring this so we can update the lambda version during deployments
      # default_cache_behavior[0].lambda_function_association,
    ]
  }
}

# Creates the DNS record to point on the main CloudFront distribution ID
resource "aws_route53_record" "website_cdn_root_record" {
  zone_id = data.aws_route53_zone.main.zone_id
  name    = var.website_domain
  type    = "A"

  alias {
    name                   = aws_cloudfront_distribution.website_cdn_root.domain_name
    zone_id                = aws_cloudfront_distribution.website_cdn_root.hosted_zone_id
    evaluate_target_health = false
  }
}

