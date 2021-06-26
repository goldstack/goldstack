variable "aws_region" {
  description = "Region where the Lambda is deployed."
  type = string
}

variable "lambda_name" {
  description = "Name of the Lambda."
  type = string
}

variable "api_domain" {
  description = "Domain under which the API should be deployed."
  type = string
}


variable "hosted_zone_domain" {
  description = "Domain for a hosted zone in AWS Route 53 that api_domain will be configured in."
  type = string
}

variable "name" {
  description = "Goldstack deployment name"
  type = string
}

variable "goldstack_workdir" {
  description = "Workdir for goldstack"
  type = string
}

variable "cors" {
  description = "CORS domain"
  type = string
}

variable "stripe_api_key" {
  description = "Private Stripe API key"
  type = string
}