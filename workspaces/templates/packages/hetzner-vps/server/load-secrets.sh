#!/bin/bash
set -e

for file in secrets/*.txt; do
  if [ -f "$file" ]; then
    filename=$(basename "$file" .txt)
    echo "Loading secret from $file as environment variable $filename"
    content=$(cat "$file")
    export "$filename"="$content"
  fi
done