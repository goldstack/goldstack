#!/bin/bash

# Update package lists
apt-get update

# Install Docker
apt-get install -y docker.io

# Enable Docker to start on boot
systemctl enable docker
systemctl start docker

# Install Git
apt-get install -y git

# Clone a Git repository
git clone https://github.com/your/repo.git /srv/myapp

# Change directory and run Docker Compose if needed (optional)
cd /srv/myapp && docker-compose up -d
