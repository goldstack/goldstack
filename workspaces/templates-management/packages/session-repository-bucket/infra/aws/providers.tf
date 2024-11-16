provider "aws" {
  region                  = var.aws_region
}

terraform {
  backend "s3" {
    # config provided dynamically using `--backend-config` CLI parameters
  }
}