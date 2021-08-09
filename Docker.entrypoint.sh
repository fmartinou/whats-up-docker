#!/bin/sh
set -e

if [ $1 == "node" ] && [ $2 == "index" ] && [ ${WUD_LOG_FORMAT} != "json" ]; then
  exec "$@" | ./node_modules/.bin/bunyan -L
else
  exec "$@"
fi