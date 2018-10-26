'use strict';

const logger = require('utils').logger;
const mq = require('utils').mq;
const service = require('../../../lib/services/ReviewsApiService');

async function moderationWatchdog () {
  logger.verbose('[rest-api::moderationWatchdog] checking hung reviews');

  try {
    const reviews = await service.resetHungModeration(7200);

    if (reviews.length) {
      logger.info('[rest-api::moderationWatchdog] fixed hung reviews', {count: reviews.length});
    } else {
      logger.debug('[rest-api::moderationWatchdog] no hung reviews found', {count: reviews.length});
    }
  } catch (err) {
    logger.error('[rest-api::moderationWatchdog] could not fix hung reviews', {error: err});
  }
}

module.exports = moderationWatchdog;
