provider "hcloud" {
  token = var.hcloud_token
}

terraform { 
  required_providers {
    hcloud = {
      source = "hetznercloud/hcloud"
      version = "~> 1.45"
    }
  }
}