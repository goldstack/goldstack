terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "6.31.0"
    }
  }
  required_version = ">= 1.1"
}

provider "aws" {
  region = var.aws_region

  skip_region_validation      = true
  skip_metadata_api_check     = true
  skip_credentials_validation = true
  shared_credentials_files    = ["aws_credentials"]
}