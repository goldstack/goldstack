#!/bin/bash

# Install Docker
apt-get install -y docker.io

# Enable Docker to start on boot
systemctl enable docker
systemctl start docker

