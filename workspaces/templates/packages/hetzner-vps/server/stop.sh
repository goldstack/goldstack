#!/bin/bash

ENV_FILE=".env"

if [ -f "$ENV_FILE" ]; then
  source $ENV_FILE
fi

echo "Stopping and removing 'caddy' container..."

docker-compose down