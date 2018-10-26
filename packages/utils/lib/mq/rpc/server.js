'use strict';

const ajv = new require('ajv')({allErrors: true});
const config = require('../../config');
const logger = require('../../logger');
const mq = require('../../mq');
const refParser = require('json-schema-ref-parser');

const CONFIG_RPC_KEY='mq.rpc';

/**
 * Validates and executes incoming message according supplied strategies
 *
 * @param {Function} validate message validator
 * @param {Function} controller message processor
 * @param {*} data content to process
 * @param {*} message rpc message to process
 */
async function rpcMessageProcessor (validate, controller, data, message) {
  logger.debug('[utils.mq.rpc.server::rpcMessageProcessor] incoming message', {fields: message.fields, properties: message.properties});

  const valid = validate(data);
  const reply = {
    success: true
  }

  if (valid) {
    reply.result = await controller(data);
  } else {
    logger.warn('[utils.mq.rpc.server::rpcMessageProcessor] invalid message', {data, error: validate.errors});

    reply.error = validate.errors;
    reply.success = false;
  }

  mq.rpc.reply(message, reply);
}

/**
 * Initializes RPC server according to config settings
 *
 * @param {String} root path to lookup controllers and schemas at
 * @throws {*} initialization errors
 */
async function initRpcServer (root) {
  const rpc = config.get(CONFIG_RPC_KEY);

  for (let p of rpc) {
    try {

      const controller = require(root + '/lib/controllers/' + p.controller);
      const schema = await refParser.dereference(root + '/spec/' + p.controller + '.json');
      const validate = ajv.compile(schema);

      const options = {
        exchangeName: p.exchange,
        routingKey: p.routingKey
      }

      mq.subscribe(p.queue, rpcMessageProcessor.bind(null, validate, controller), options);
      logger.info('[utils.mq.rpc.server::initRpcServer] controller enabled', {settings: p});
    } catch (error) {
      logger.error('[utils.mq.rpc.server::initRpcServer] server initialization failed', {error});
      throw error;
    }
  }
  logger.info('[utils.mq.rpc.server::initRpcServer] init completed');
}

module.exports = {
  initRpcServer
}
