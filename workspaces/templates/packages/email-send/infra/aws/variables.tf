variable "aws_region" {
  description = "Region where the S3 bucket is deployed."
  type = string
}

variable "domain" {
  description = "Domain that emails are sent from"
  type = string
}

variable "hosted_zone_domain" {
  description = "Route 53 Hosted Zone domain"
  type = string
}
