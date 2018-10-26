const config = require('config');
const conn = require('./connection');
const logger = require('../logger');
const rpc = require('amqplib-rpc');

/**
 * Sends RPC request to a given queue with application/json payload
 *
 * @param {String} queue queue name
 * @param {Object} message message object
 * @param {Object} options amqplib-rpc.request options
 * @returns {Object} reply from remote
 */
async function request (queue, message, options = {}) {
  const {connection} = await conn.defaults;
  const {sendOpts = {}} = options;

  options.sendOpts = sendOpts;

  if (options.exchangeName) {
    await conn.prepareExchange(options.exchangeName);
  }
  if (!sendOpts.contentType) {
    sendOpts.contentType = 'application/json';
  }

  const result = await rpc.request(connection, queue, message, options);

  // TODO: check result content type
  return JSON.parse(result.content);
}

/**
 * Replies for a given message
 *
 * @param {Object} message message sent by @{link #request} method
 * @param {Object} reply reply message object
 * @param {Object} options amqplib#publish options
 * @returns {Object} reply from remote
 */
async function reply (message, reply, options = {}) {
  const {channel} = await conn.defaults;

  if (!options.contentType) {
    options.contentType = 'application/json';
  }
/*
  // kind of broken thing, amqplib dies with node process stop
  // when tries to access a locked queue
  const exists = await rpc.checkReplyQueue(connection, message);
  if (!exists) {
    logger.error('[utils::mq.reply] reply queue does not exits', {fields: message.fields});
  }
*/

  return await rpc.reply(channel, message, reply, options);
}


module.exports = {
  request,
  reply,
};
