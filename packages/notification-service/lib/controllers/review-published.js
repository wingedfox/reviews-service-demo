'use strict';

const config = require('utils').config;
const got = require('got');
const logger = require('utils').logger;

/**
 * Sends notification to a customer
 *
 * @param {Object} data review data
 */
async function publishedNotification (data) {
  const {id} = data;

  // TODO: use swagger-generated client
  const review = JSON.parse((await got(config.get('services.review.url') + id)).body);
  const product = JSON.parse((await got(config.get('services.product.url') + review.productid)).body);
  const {email, name} = review;

  // TODO: use templating lib (mustache?)
  const message = `Dear ${name},

Your review for ${product.name} has been published.

Sincerely yours,
Adventureworks Team`;

  logger.info('[notification-service::review-published] send notification', {message});

}

module.exports = publishedNotification;
