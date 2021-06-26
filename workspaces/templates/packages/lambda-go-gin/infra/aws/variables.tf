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
  description = "Goldstack deployment name."
  type = string
}

variable "cors" {
  description = "Domain for an UI that should be allowed to access this server."
  type = string
  default = ""
}