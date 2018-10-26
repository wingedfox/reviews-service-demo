'use strict';

const config = require('utils').config;
const logger = require('utils').logger;
const mq = require('utils').mq;

async function init () {
  logger.info('[notification-service::init] initialize notification subscribers');

  const subscribers = config.get('mq.subscribers');

  for (let subscriber of subscribers) {
    try {
      const ctrl = require('./controllers/' + subscriber.controller);
      const options = {
        exchangeName: subscriber.exchange,
        routingKey: subscriber.routingKey
      }
      await mq.subscribe(subscriber.queue, ctrl, options);

      logger.info('[notification-service::init] notification subscriber created', {subscriber});
    } catch (error) {
      logger.error('[notification-service::init] notification subscriber creation error', {error, subscriber});
      throw(error);
    }
  }
}

init().catch(process.exit);
