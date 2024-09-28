variable "aws_region" {
  description = "Region where the Lambda is deployed."
  type = string
}

variable "lambda_name" {
  description = "Name of the Lambda."
  type = string
}

variable "name" {
  description = "Goldstack deployment name."
  type = string
}
