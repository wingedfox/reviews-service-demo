# Seeded postgres image
FROM postgres:9-alpine

RUN apk update && \
    apk add --no-cache openssh-client git

# Build defaults
ARG SEED_DIR=/seed_db
ARG SEED_FILE=install.sql
ARG SEED_REF=
ARG SEED_REPO=

RUN mkdir -p ${SEED_DIR} && \
    mkdir ~/.ssh/ && \
    touch ~/.ssh/known_hosts && \
    ssh-keyscan -t rsa github.com > ~/.ssh/known_hosts && \
    git clone -b ${SEED_REF} --depth 1 ${SEED_REPO} ${SEED_DIR} && \
    [ -f "${SEED_DIR}/${SEED_FILE}" ]

# ENV overrides
ENV POSTGRES_DB=${POSTGRES_DB:-default_db} \
    POSTGRES_USER=${POSTGRES_USER} \
    POSTGRES_PASSWORD=${POSTGRES_PASSWORD} \
    POSTGRES_SEED_FILE=${SEED_DIR}/${SEED_FILE}

RUN export

COPY seed_db.sh /docker-entrypoint-initdb.d/
