#!/bin/bash

# Check if a container named 'caddy' is already running
if [ "$(docker ps -q -f name=caddy)" ]; then
  echo "Stopping and removing existing 'caddy' container..."
  docker stop caddy
  docker rm caddy
elif [ "$(docker ps -aq -f name=caddy)" ]; then
  # If the container exists but is not running, remove it
  echo "Removing existing 'caddy' container..."
  docker rm caddy
fi

echo "Starting server"

docker run -d \
  --name caddy \
  -p 80:80 \
  -p 443:443 \
  -v $(pwd)/Caddyfile:/etc/caddy/Caddyfile \
  -v $(pwd)/site:/usr/share/caddy/site \
  -v caddy_data:/data \
  -v caddy_config:/config \
  caddy
