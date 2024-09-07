
resource "hcloud_server" "my_server" {
  name        = "docker-server"
  image       = "ubuntu-22.04"
  server_type = "cpx11" # 1 vcpu 2gb ram 20 GB hdd  https://docs.hetzner.com/cloud/servers/overview
  location    = "hil" # https://docs.hetzner.com/cloud/general/locations/
  ssh_keys    = [data.hcloud_ssh_key.my_ssh_key.id]

  user_data = file("cloud-init.sh")  # Pointing to the init script
}

data "hcloud_ssh_key" "my_ssh_key" {
  fingerprint = "73:db:08:81:7f:fe:34:c3:40:2e:10:d0:89:a7:b7:12"
}

#resource "hcloud_ssh_key" "my_ssh_key" {
#  name       = "my-key"
#  public_key = file("~/.ssh/id_ed25519.pub")
#}
