const config = require('./lib/config');
const logger = require('./lib/logger');

module.exports.config = config;
module.exports.logger = logger;

if (config.has('cron')) {
  module.exports.cron = require('./lib/cron');
}
if (config.has('db')) {
  module.exports.db = require('./lib/db');
}
if (config.has('mq')) {
  module.exports.mq = require('./lib/mq');
  module.exports.mq.rpc = require('./lib/mq/rpc');
  if (config.has('mq.rpc')) {
    module.exports.mq.rpc.server = require('./lib/mq/rpc/server');
  }
}
