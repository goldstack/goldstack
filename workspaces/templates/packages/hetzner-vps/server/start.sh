#!/bin/bash

ENV_FILE=".env"

if [ -f "$ENV_FILE" ]; then
  source $ENV_FILE
fi

echo "Starting server"

docker-compose up -d