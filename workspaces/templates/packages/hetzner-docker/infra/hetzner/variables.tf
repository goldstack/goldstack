
variable "hcloud_token" {
  sensitive = true
}

variable "location" {
  description = "Hetzner location where server should be deployed"
  type = string
}

variable "domain" {
  description = "Domain that server should be hosted at"
  type = string
}

