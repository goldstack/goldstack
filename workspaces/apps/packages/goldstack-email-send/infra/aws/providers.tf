provider "aws" {
  region                  = var.aws_region
      shared_credentials_files = ["aws_credentials"]
}


