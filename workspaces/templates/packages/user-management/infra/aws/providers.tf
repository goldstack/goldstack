
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "5.76.0"
    }
  }
  required_version = ">= 1.6"
}

provider "aws" {
  region                  = var.aws_region

   # Skipping various checks to speed up AWS provider
  skip_region_validation      = true
  skip_metadata_api_check     = true
  skip_credentials_validation = true
}

# The provider below is required for CloudFront
provider "aws" {
  alias                   = "us-east-1"
  region                  = "us-east-1"
  
  # Skipping various checks to speed up AWS provider
  skip_region_validation      = true
  skip_metadata_api_check     = true
  skip_credentials_validation = true
}

terraform {
  backend "s3" {
    # config provided dynamically using `--backend-config` CLI parameters

    # Skipping various checks to speed up backend initialisation
    skip_credentials_validation = true
    skip_metadata_api_check     = true
    skip_region_validation      = true
  }
}
