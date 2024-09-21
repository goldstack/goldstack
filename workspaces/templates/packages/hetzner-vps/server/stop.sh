#!/bin/bash

ENV_FILE=".env"

if [ -f "$ENV_FILE" ]; then
  source $ENV_FILE
fi

echo "stop"


# Stop the Docker container named 'caddy'
docker stop caddy

# Remove the Docker container named 'caddy'
docker rm caddy