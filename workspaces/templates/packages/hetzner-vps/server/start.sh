#!/bin/bash
set -e

APP_DIR="/home/goldstack/app"
ENV_FILE="$APP_DIR/.env"

if [ -f "$ENV_FILE" ]; then
  source $ENV_FILE
fi

chmod +x "$APP_DIR/load-secrets.sh"
source "$APP_DIR/load-secrets.sh"

echo "Starting server in ${ENVIRONMENT:-development} mode"


cd "$APP_DIR" && COMPOSE_PROJECT_NAME=server docker-compose up -d


# Clean up images
sudo docker image prune -a -f