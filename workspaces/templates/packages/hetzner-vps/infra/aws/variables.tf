
variable "hcloud_token" {
  sensitive = true
}

variable "server_name" {
  description = "The name for the Hetzner server"
  type = string
}


variable "location" {
  description = "Hetzner location where server should be deployed"
  type = string
}


variable "server_type" {
  description = "Hetzner server type to be used"
  type = string
}

variable "ssh_user_fingerprint" {
  description = "The SSH fingerprint of the SSH user that should be given access to the server"
  type = string
  default = null
}

variable "aws_region" {
  description = "Region where the S3 bucket is deployed."
  type = string
}
