provider "aws" {
  version                 = "2.65.0"
  region                  = var.aws_region
}

terraform {
  backend "s3" {
    # config provided dynamically using `--backend-config` CLI parameters
  }
}