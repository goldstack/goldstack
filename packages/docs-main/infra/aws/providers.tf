provider "aws" {
  version                 = "2.65.0"
  region                  = var.aws_region
}

# The provider below is required to handle ACM
provider "aws" {
  alias                   = "us-east-1"
  version                 = "2.65.0"
  region                  = "us-east-1"
}