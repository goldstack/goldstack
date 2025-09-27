terraform {
  required_providers {
    archive = {
      source = "hashicorp/archive"
      version = "2.2.0"
    }
    aws = {
      source = "hashicorp/aws"
      version = "5.76.0"
    }
  }
  required_version = ">= 1.6"
}

provider "aws" {
  region                      = var.aws_region

  # Skipping various checks to speed up AWS provider
  skip_region_validation      = true
  skip_metadata_api_check     = true
  skip_credentials_validation = true
  shared_credentials_files = ["aws_credentials"]
}

# The provider below is required to handle ACM
provider "aws" {
  alias                       = "us-east-1"
  region                      = "us-east-1"
  
  # Skipping various checks to speed up AWS provider
  skip_region_validation      = true
  skip_metadata_api_check     = true
  skip_credentials_validation = true
  shared_credentials_files = ["aws_credentials"]
}
