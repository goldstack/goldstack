provider "aws" {
  region                  = var.aws_region
}

# The provider below is required to handle ACM
provider "aws" {
  alias                   = "us-east-1"
  region                  = "us-east-1"
}

terraform {
  backend "s3" {
    # config provided dynamically using `--backend-config` CLI parameters
  }
}
