terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.0"
    }
  }

  required_version = ">= 1.0.0"
}

provider "aws" {
  region = var.aws_region
}

module "open_next_zone" {
  source = "registry.terraform.io/RJPearson94/open-next/aws//modules/tf-aws-open-next-zone"
  version = "3.0.2"

  prefix = "open-next-${data.aws_caller_identity.current.account_id}"

  folder_path          = "./.open-next"
  s3_exclusion_regex   = ".*\\.terragrunt*"

  continuous_deployment = {
    use = false
    deployment = "NONE"
    traffic_config = {
      header = {
        name  = "aws-cf-cd-staging"
        value = "true"
      }
    }
  }

  additional_server_functions = {
    iam_policies = {
      include_bucket_access             = true
      include_revalidation_queue_access = true
      include_tag_mapping_db_access     = true
    }
  }

  website_bucket = {
    force_destroy = true
  }

  open_next_version = "v3.x.x"
}

data "aws_caller_identity" "current" {}
