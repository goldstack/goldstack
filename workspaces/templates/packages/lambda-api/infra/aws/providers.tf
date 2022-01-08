terraform {
  required_providers {
    archive = {
      source = "hashicorp/archive"
      version = "2.1.0"
    }
    aws = {
      source  = "hashicorp/aws"
      version = "~> 3.0"
    }
    random = {
      source = "hashicorp/random"
    }
  }
  required_version = ">= 0.13"
}

provider "aws" {
  region                  = var.aws_region
}

provider "archive" {
}

terraform {
  backend "s3" {
    # config provided dynamically using `--backend-config` CLI parameters
  }
}