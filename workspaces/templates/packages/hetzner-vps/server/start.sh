#!/bin/bash
set -e

ENV_FILE=".env"

if [ -f "$ENV_FILE" ]; then
  source $ENV_FILE
fi

source ./load-secrets.sh

echo "Starting server"

docker-compose up -d