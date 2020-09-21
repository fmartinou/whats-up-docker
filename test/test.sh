#!/bin/bash

set -e

# Pull Alpine
docker pull nginx:1.10-alpine

# Tag as if coming from private Hub, ECR...
docker tag nginx:1.10-alpine fmartinou/test:1.0.0
docker tag nginx:1.10-alpine 229211676173.dkr.ecr.eu-west-1.amazonaws.com/test:1.0.0
docker tag nginx:1.10-alpine 229211676173.dkr.ecr.eu-west-1.amazonaws.com/sub/test:1.0.0
docker tag nginx:1.10-alpine 229211676173.dkr.ecr.eu-west-1.amazonaws.com/sub/sub/test:1.0.0
docker tag nginx:1.10-alpine gcr.io/wud-test/test:1.0.0
docker tag nginx:1.10-alpine gcr.io/wud-test/sub/test:1.0.0
docker tag nginx:1.10-alpine gcr.io/wud-test/sub/sub/test:1.0.0

docker-compose down --remove-orphans

docker-compose up -d