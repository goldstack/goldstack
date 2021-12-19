provider "aws" {
  version                 = "3.37.0"
  region                  = var.aws_region
}

provider "archive" {
  version = "2.1.0"
}

terraform {
  backend "s3" {
    # config provided dynamically using `--backend-config` CLI parameters
  }
}