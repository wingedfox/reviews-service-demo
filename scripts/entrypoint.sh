#!/bin/sh

set -e

until ([ -z $PGHOST ] || psql -c "select version()" -q >/dev/null 2>&1) && ([ -z $MQHOST ] || nc -z $MQHOST $MQPORT); do
  >&2 echo "Services are unavailable - sleeping";
  sleep 1;
done

pm2 start --no-daemon ../../scripts/app.json --watch
