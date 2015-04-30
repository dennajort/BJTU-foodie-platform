#!/bin/bash

set -x
docker build --pull -t bjtu-foodie-platform:"$BUILD_ID" .
docker stop bjtu-foodie && docker rm bjtu-foodie
docker run -d \
  --name "bjtu-foodie" \
  --link "postgres:postgres" \
  --restart "always" \
  bjtu-foodie-platform:latest
