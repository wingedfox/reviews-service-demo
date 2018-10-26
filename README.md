Reviews service
=======================
Service demonstrates distributed application for products reviews processing.

Architecture
------------
* API definition: OAS 3.0
* Runtime: NodeJS
* Web server: ExpressJS
* Database: PostgreSQL
* Messaging: Rabbitmq
* Deployment: Docker + Docker Compose

Prerequisites
-------------
* git v2.7+
* Runtime
  * docker v18+
  * docker-compose v1.21+
* Development
  * nodejs v6+

Installation
------------
Get sources
```bash
$ git checkout https://github.com/wingedfox/reviews-service-demo
```

Configuration
-------------
Configuration is layered and listed in order of precedence
* Dockerized setup
  * `./docker/.env`
  * `./docker/docker-compose.yaml`
  * `<service>/config/default.yaml`
* Development setup
  * environment variables
  * `<service>/config/local.yaml`
  * `<service>/config/default.yaml`

Running
-------
### Run docker environment
```bash
$ cd reviews-service-demo/docker
$ docker-compose up -d
```

NOTE: All necessary configuration options are in `./docker/.env`, review it before running environment.

### Run development environment
```bash
$ npx lerna bootstrap
$ cd reviews-service-demo/docker
$ docker-compose up -d pg mq
$ cd ../packages/<service>/
$ npm start
```

NOTE: Use `local.yaml` or env vars for correct MQ and PG access credentials.

Testing
-------

### Manual
Use supplied Docs UI for testing, all examples are attached to the correspponding methods: http://localhost:8080/docs

NOTE: Profanity is checked against a dictionary of 'bad words'.

### Automated
```bash
$ cd reviews-service-demo
$ npm run test
```

Environment
-----------
* Build scripts:
  * Dockerfile: `./Dockerfile`
  * docker-compose.yml: `./docker/docker-compose.yml`
* Web services:
  * REST API: http://localhost:8080/v1/
  * Api Docs: http://localhost:8080/docs
* Database: `pg://localhost:5432`
* MQ:
  * API: `amqp://localhost:5672`
  * Management Console: http://localhost:15672
* Logs: `docker logs -f <service_name>`

Example queries
---------------
### Create Review
```bash
curl -X POST "http://localhost:8080/v1/review" -H  "accept: application/json" -H  "Content-Type: application/json" -d "{\"name\":\"Elvis Presley\",\"email\":\"theking@elvismansion.com\",\"productid\":\"2\",\"rating\":4,\"review\":\"Shit. Cause there's, no room to rhumba in a sports car\You can't move forward or back\There's no room to do what the beat tells you to\Without throwing your spine outta wack\"}"
```

### Retrieve review
```bash
curl -X GET "http://localhost:8080/v1/review/ed14e626-b2fa-43b7-ae7a-38ae7525143f" -H  "accept: application/json"
```

### Retrieve product
```bash
curl -X GET "http://localhost:8080/v1/product/2" -H  "accept: application/json"
```
