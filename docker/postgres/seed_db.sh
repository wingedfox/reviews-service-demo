#!/bin/sh

echo "*** CREATING DATABASE ${POSTGRES_DB} ***"

cd `dirname ${POSTGRES_SEED_FILE}`

psql -d ${POSTGRES_DB} --user ${POSTGRES_USER} < ${POSTGRES_SEED_FILE}

echo "*** DATABASE CREATED! ***"