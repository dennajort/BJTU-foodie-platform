#!/bin/bash

set -x
IMAGE="bjtu-foodie-platform"
CONTAINER="bjtu-foodie"
docker build --pull -t "$IMAGE":"$BUILD_ID" -t "$IMAGE":latest .
(docker stop "$CONTAINER" && docker rm "$CONTAINER") || true
docker run -d \
  --name "$CONTAINER" \
  --link "postgres:postgres" \
  --restart "always" \
  -p "127.0.0.1:9090:3000" \
  "$IMAGE":latest
