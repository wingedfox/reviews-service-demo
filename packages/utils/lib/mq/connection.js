const config = require('../config');
const amqp = require('amqplib');
const logger = require('../logger');

const CONFIG_CONNECTION_KEY = 'mq.connection';

const defaults = new Promise(async (res,rej) => {
  try {
    const connection = await getConnection();
    const channel = await getChannel(connection);
    res({connection, channel});
  } catch (err) {
    rej(err);
  }
});

/**
 * @param {amqplib.config} [cfg] connection options, defaults are taken from config.mq
 * @returns {amqplib.Connection} established connection
 * @throws {*} connection errors
 */
async function getConnection(cfg) {
  if (!cfg) {
    cfg = config.get(CONFIG_CONNECTION_KEY);
  }

  logger.debug('[utils.mq.connection::getConnection] setup mq connection', {config: cfg});
  return await amqp.connect(cfg);
}

/**
* @param {amqplib.Connection} [connection] connection, if empty default one is taken
* @returns {amqplib.Channel} setup channel
* @throws {*} connection errors
*/
async function getChannel(connection) {
  logger.debug('[utils.mq.connection::getChannel] setup mq channel');
  if (connection) {
    // create new channel even for default connection
    return await connection.createChannel();
  } else {
    return (await defaults).channel;
  }
}


/**
 * Checks exchange existence and creates one if not found
 *
 * @param {String} exchange exchange name to check
 * @param {String} [type=direct] exchange type to setup
 */
async function prepareExchange (exchange, type = 'direct') {
  const {channel} = await defaults;

  await channel.assertExchange(exchange, 'direct');
  logger.silly('[utils.mq::prepareExchange] exchange prepared', {exchange, type});
}

/**
 * Checks queue for existence and creates one if not found
 * Binds queue to an exchange using provided routing key
 *
 * @param {String} queue queue name to check
 * @param {String} exchange exchange name to bind to
 * @param {String} [routingKey=#] routing key to bind queue with
 */
async function prepareQueue (queue, exchange, routingKey = '#') {
  const {channel} = await defaults;

  await channel.assertQueue(queue);
  logger.silly('[utils.mq::prepareQueue] queue prepared', {queue});

  if (exchange) {
    await prepareExchange(exchange);
    await channel.bindQueue(queue, exchange, routingKey);
    logger.silly('[utils.mq::prepareQueue] queue is bound to exchange', {queue, exchange, routingKey});
  }
}

module.exports = {
  defaults,
  getConnection,
  getChannel,
  prepareExchange,
  prepareQueue
};
