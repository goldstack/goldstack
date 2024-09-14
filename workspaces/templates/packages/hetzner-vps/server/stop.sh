#!/bin/bash

echo "stop"


# Stop the Docker container named 'caddy'
docker stop caddy

# Remove the Docker container named 'caddy'
docker rm caddy