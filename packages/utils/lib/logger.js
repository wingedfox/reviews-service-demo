const config = require('config');
const Winston = require('winston');

const logger = Winston.createLogger({
  level: String(config.get('log.level')).toLowerCase(),
  format: Winston.format.combine(
    Winston.format.timestamp(),
    Winston.format.prettyPrint()
  ),
  transports: [
    new Winston.transports.Console(),
  ]
});

module.exports = logger;
