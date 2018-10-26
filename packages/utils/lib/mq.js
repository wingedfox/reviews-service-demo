const amqp = require('amqplib');
const config = require('config');
const conn = require('./mq/connection');
const logger = require('./logger');

/**
 * Publishes message to a given exchange
 *
 * @param {String} exchange exchange name
 * @param {*} message arbitrary JSON-serializable message
 * @param {Object} [options] publish options
 * @param {String} [options.routingKey=#] default routing key
 * @param {Object} [options.publishOptions={}] options for amqp.publish
 * @param {Object} [options.publishOptions.contentType=application/json] content type of the message
 * @returns {Promise} send result
 */
async function publish (exchange, message, options = {}) {
  const {channel} = await conn.defaults;
  const {routingKey = '#',
         publishOptions = {}} = options;

  await conn.prepareExchange(exchange);

  if (!publishOptions.contentType) {
    publishOptions.contentType = 'application/json';
  }

  logger.debug('[utils.mq::publish] publishing message', {exchange, routingKey, message});
  return await channel.publish(exchange, routingKey, new Buffer(JSON.stringify(message)), publishOptions);
}


/**
 * Publishes message to a given exchange
 *
 * @param {String} queue queue name to listen to
 * @param {Function(Object, Object)} listener message listener accepting message data and message as arguments
 * @param {Object} [options] subscribe options
 * @param {Object} [options.exchangeName] exchange name to bind queue to
 * @param {Object} [options.routingKey] routing key to bind queue to exchange with
 * @param {Object} [options.subscribeOptions] options for amqp.subscribe
 * @param {Object} [options.subscribeOptions.contentType=application/json] content type of the message
 * @returns {Promise} subscribe result
 */
async function subscribe (queue, listener, options = {}) {
  const {channel} = await conn.defaults;
  const {contentType = 'application/json',
         consumeOptions = {},
         exchangeName,
         routingKey} = options;

  await conn.prepareQueue(queue, exchangeName, routingKey);
  return await channel.consume(queue, async (message) => {
      logger.debug('[utils.mq::subscribe] incoming message', {fields: message.fields});

      if (message.properties.contentType != contentType) {
        logger.warn('[utils.mq::subscribe] incoming message with incorrect content type',
          {expected: contentType, incoming: message.properties.contentType, fields: message.fields, properties: message.properties });

        // do not keep broken messages
        channel.nack(message, false, false);
      } else {
        try {
          const data = JSON.parse(message.content);
          await listener(data, message);

          // mark consumed
          channel.ack(message);
        } catch(error) {
          logger.error('[utils.mq::subscribe] message processing error', {error, fields: message.fields});

          // schedule redelivery
          channel.nack(message, false, true);
        }
      }
    }, consumeOptions);
}

module.exports = {
  defaults: conn.defaults,
  publish,
  subscribe
};
