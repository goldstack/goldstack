#!/bin/bash

ENV_FILE=".env"

if [ -f "$ENV_FILE" ]; then
  source $ENV_FILE
fi

chmod +x "$APP_DIR/load-secrets.sh"
source "$APP_DIR/load-secrets.sh"

COMPOSE_PROJECT_NAME=server docker-compose down