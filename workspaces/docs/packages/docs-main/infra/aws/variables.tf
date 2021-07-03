variable "aws_region" {
  description = "Region where S3 buckets are deployed."
  type = string
}

variable "tfstate_bucket" {
  description = "The name of the bucket where Terraform state is stored"
  type = string
}

variable "tfstate_key" {
  description = "The key in the bucket where Terraform state is stored"
  type = string
}

variable "tfstate_region {
  description = "The region where the Terraform state bucket is deployed"
  type = string
}

variable "tfstate_dynamodb_table" {
  description = "DynamoDB table that is used for Terraform state locking"
  type = string
}

variable "hosted_zone_domain" {
  description = "Domain of the Route 53 hosted zone this website domain should be added to"
  type = string
}

variable "website_domain" {
  description = "Main website domain, e.g. cloudmaniac.net"
  type = string
}

variable "website_domain_redirect" {
  description = "Secondary domain that will redirect to the main domain"
  type = string
}

variable "default_cache_duration" {
  description = "Default duration for which resources will be cached"
  type = number
}
