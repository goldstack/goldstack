#!/bin/bash

ENV_FILE=".env"

if [ -f "$ENV_FILE" ]; then
  source $ENV_FILE
fi

COMPOSE_PROJECT_NAME=server docker-compose down