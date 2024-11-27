provider "aws" {
  region                  = var.aws_region
        shared_credentials_files = ["aws_credentials"]  
}

# The provider below is required to handle ACM
provider "aws" {
  alias                   = "us-east-1"
  region                  = "us-east-1"
          shared_credentials_files = ["aws_credentials"]  
}

