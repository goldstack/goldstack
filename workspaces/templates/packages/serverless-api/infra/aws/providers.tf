terraform {
  required_providers {
    archive = {
      source = "hashicorp/archive"
      version = "2.2.0"
    }
    aws = {
      source  = "hashicorp/aws"
      version = "5.76.0"
    }
    random = {
      source = "hashicorp/random"
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

provider "archive" {
}

# terraform {
#   backend "s3" {
#     bucket = var.state_bucket
#     key    = var.state_key
#     dynamodb_table = var.state_dynamodb_table

#     # Skipping various checks to speed up backend initialisation
#     skip_credentials_validation = true
#     skip_metadata_api_check     = true
#     skip_region_validation      = true

#     shared_config_files = ["aws_credentials"]
#   }
# }