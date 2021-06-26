variable "aws_region" {
  description = "Region where docker image will be deployed."
  type = string
}

variable "repository_name" {
  description = "Name for the repository for this image. Must be unique."
  type = string
}

