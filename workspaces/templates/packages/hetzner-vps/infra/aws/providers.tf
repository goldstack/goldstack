provider "hcloud" {
  token = var.hcloud_token
}

terraform { 
  required_providers {
    hcloud = {
      source = "hetznercloud/hcloud"
      version = "~> 1.45"
    }
    aws = {
      source  = "hashicorp/aws"
      version = "5.76.0"
    }
  }
}

provider "aws" {
  region                  = var.aws_region

   # Skipping various checks to speed up AWS provider
  skip_region_validation      = true
  skip_metadata_api_check     = true
  skip_credentials_validation = true

  shared_credentials_files = ["aws_credentials"]
}
