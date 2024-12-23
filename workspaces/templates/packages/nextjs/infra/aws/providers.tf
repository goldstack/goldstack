provider "aws" {

}

provider "aws" {
  alias = "server_function"
}

provider "aws" {
  alias = "iam"
}

provider "aws" {
  alias = "dns"
}

provider "aws" {
  alias  = "global"
  region = "us-east-1"
}