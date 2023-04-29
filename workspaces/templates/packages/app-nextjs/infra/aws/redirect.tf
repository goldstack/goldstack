
# Creates bucket for forward domain
resource "aws_s3_bucket" "website_redirect" {
  count  = var.website_domain_redirect != null ? 1 : 0

  bucket = "${var.website_domain}-redirect"

  # Remove this line if you want to prevent accidential deletion of bucket
  force_destroy = true

  website {
    redirect_all_requests_to = "https://${var.website_domain}"
  }

  tags = {
    ManagedBy = "terraform"
    Changed   = formatdate("YYYY-MM-DD hh:mm ZZZ", timestamp())
  }

  lifecycle {
    ignore_changes = [tags]
  }
}

resource "aws_s3_bucket_public_access_block" "website_redirect" {
  count  = var.website_domain_redirect != null ? 1 : 0

  bucket = aws_s3_bucket.website_redirect[0].id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

resource "aws_s3_bucket_ownership_controls" "website_redirect" {
  count  = var.website_domain_redirect != null ? 1 : 0

  bucket = aws_s3_bucket.website_redirect[0].id
  rule {
    object_ownership = "BucketOwnerPreferred"
  }
}

resource "aws_s3_bucket_acl" "website_redirect" {
  count  = var.website_domain_redirect != null ? 1 : 0

  depends_on = [
	  aws_s3_bucket_public_access_block.website_redirect,
	  aws_s3_bucket_ownership_controls.website_redirect,
  ]

  bucket = aws_s3_bucket.website_redirect[0].id
  acl    = "public-read"

}

resource "aws_s3_bucket_policy" "website_redirect" {
  count  = var.website_domain_redirect != null ? 1 : 0

  depends_on = [
	  aws_s3_bucket_public_access_block.website_redirect,
	  aws_s3_bucket_ownership_controls.website_redirect,
  ]

  bucket = aws_s3_bucket.website_redirect[0].id
  policy = data.aws_iam_policy_document.website_redirect.json
}

data "aws_iam_policy_document" "website_redirect" {
  statement {
    principals {
      type        = "AWS"
      identifiers = ["*"]
    }

    actions = [
      "s3:GetObject",
    ]

    resources = [ 
      "arn:aws:s3:::${var.website_domain}-redirect/*"
    ]
  }
}


resource "aws_s3_bucket_object" "redirect_file" {
  count  = var.website_domain_redirect != null ? 1 : 0

  key     = "index.html"
  bucket  = aws_s3_bucket.website_redirect[0].bucket
  content = "Redirect placeholder."

  content_type = "text/html"
  website_redirect = "https://${var.website_domain}/"

  force_destroy = true
}

# CloudFront for redirect (to support https://)
resource "aws_cloudfront_distribution" "website_cdn_redirect" {
  count  = var.website_domain_redirect != null ? 1 : 0

  depends_on = [
  ]
  enabled     = true
  price_class = "PriceClass_All" # Select the correct PriceClass depending on who the CDN is supposed to serve (https://docs.aws.amazon.com/AmazonCloudFront/ladev/DeveloperGuide/PriceClass.html)
  aliases     = [var.website_domain_redirect]
  provider    = aws.us-east-1

  origin {
    origin_id   = "origin-bucket-${aws_s3_bucket.website_redirect[0].id}"
    domain_name = aws_s3_bucket.website_redirect[0].website_endpoint

    custom_origin_config {
      http_port = 80
      https_port = 443
      origin_protocol_policy = "http-only"
      origin_ssl_protocols = ["TLSv1.2"]
    }
  }

  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT", "DELETE"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "origin-bucket-${aws_s3_bucket.website_redirect[0].id}"
    min_ttl          = "0"
    default_ttl      = tostring(var.default_cache_duration)
    max_ttl          = "1200"

    viewer_protocol_policy = "redirect-to-https" # Redirects any HTTP request to HTTPS
    compress               = true

    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
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
  count  = var.website_domain_redirect != null ? 1 : 0

  zone_id = data.aws_route53_zone.main.zone_id
  name    = var.website_domain_redirect
  type    = "A"

  alias {
    name                   = aws_cloudfront_distribution.website_cdn_redirect[0].domain_name
    zone_id                = aws_cloudfront_distribution.website_cdn_redirect[0].hosted_zone_id
    evaluate_target_health = false
  }
}

