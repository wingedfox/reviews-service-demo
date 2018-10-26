'use strict';

const filter = new (require('bad-words-relaxed'))();
const logger = require('utils').logger;
/**
 * Checks message for profanity
 *
 * @param {Object} data message to check
 * @returns {Object} check results
 */
function checkContentLanguage (data) {
  const result = {
    id: data.id,
    appropriate: !filter.isProfane(data.text)
  }

  logger.info('[moderation-service::checkContentLanguage] Message has been checked', {result});

  return result;
}

module.exports = checkContentLanguage;
