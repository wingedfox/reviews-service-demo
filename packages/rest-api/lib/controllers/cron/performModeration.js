'use strict';

const logger = require('utils').logger;
const mq = require('utils').mq;
const service = require('../../../lib/services/ReviewsApiService');

const EXCHANGE = 'reviews';
const ROUTING_KEY = 'moderation-task';

async function performModeration () {
  logger.verbose('[rest-api::performModeration] fetch reviews for moderation');

  try {
    const reviews = await service.fetchForModeration();

    if (reviews.length) {
      const rpcOptions = {
        exchangeName: EXCHANGE,
        timeout: 10000
      }

      const replies = await Promise.all(reviews.map(r => {
          const data = {
            id: r.rowguid,
            text: r.comments
          }

          return mq.rpc.request(ROUTING_KEY, data, rpcOptions);
        }));

      const results = await Promise.all(replies.map(r => {
        if (r.success) {
          return service.updateModerationStatus(r.result);
        }
      }));

      logger.info('[rest-api::performModeration] reviews processed', {count: results.length,
        appropriate: replies.filter(r=>r.success&&r.result.appropriate).length,
        inappropriate: replies.filter(r=>r.success&&!r.result.appropriate).length});
    } else {
      logger.debug('[rest-api::performModeration] no reviews found');
    }
  } catch (err) {
    logger.error('[rest-api::performModeration] could not send reviews for moderation', {error: err});
  }
}

module.exports = performModeration;
