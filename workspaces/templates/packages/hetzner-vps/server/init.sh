#!/bin/bash
set -e

ENV_FILE=".env"

if [ -f "$ENV_FILE" ]; then
  source $ENV_FILE
fi

chmod +x ./load-secrets.sh
source ./load-secrets.sh

echo "init ran"