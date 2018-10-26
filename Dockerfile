FROM node:8-alpine
MAINTAINER Ilya Lebedev <ilya@lebedev.net>

RUN apk update && \
    apk add --no-cache openssh-client postgresql-client git

ARG APP_DIR=/opt/app

RUN mkdir -p ${APP_DIR} && \
    mkdir ~/.ssh/ && \
    touch ~/.ssh/known_hosts && \
    ssh-keyscan -t rsa github.com > ~/.ssh/known_hosts && \
    npm install -g pm2@2.10.4

WORKDIR ${APP_DIR}

COPY package.json package-lock.json ./

RUN npm install

COPY . .
# Run only one app
ARG APP=
RUN npx lerna bootstrap --hoist --include-filtered-dependencies --scope ${APP} && \
    apk del git openssh-client

WORKDIR ${APP_DIR}/packages/${APP}

CMD ["sh", "../../scripts/entrypoint.sh"]
