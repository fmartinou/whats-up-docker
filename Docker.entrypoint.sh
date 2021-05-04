#!/bin/sh
set -e

BUNYAN_CLI=''

if [ $1 == "node" ] && [ $2 == "index" ] && [ ${WUD_LOG_FORMAT} != "json" ]; then
  exec "$@" | ./node_modules/.bin/bunyan
else
  exec "$@"
fi