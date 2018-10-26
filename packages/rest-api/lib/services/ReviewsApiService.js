'use strict';

const config = require('utils').config;
const db = require('utils').db;
const logger = require('utils').logger;
const mq = require('utils').mq;

/**
 * Create a review
 * Operation submits a review to a moderation queue
 *
 * body object Creates new review
 * returns object
 **/
exports.reviewCreate = async function(body) {
  logger.info('[rest-api.ReviewApiService::reviewCreate] Create new review', {review: body});

  const data = await db.raw(`SELECT productid id
                         FROM production.product
                        WHERE productid = :id`, {id: body.productid});

  if (!data.rows.length) {
    throw new Error('Product not found');
  }

  const result = await db.raw(`INSERT INTO production.productreview
                                           (productid, reviewername, emailaddress, rating, comments)
                                    VALUES (:productid, :name, :email, :rating, :review)
                                 RETURNING rowguid as id, productid, reviewername as name,
                                           emailaddress as email, rating, comments as review,
                                           status`, body);
  const review = result.rows.pop();
  return review;
}


/**
 * Retrieves a single review
 * Retrieves a review and moderation status
 *
 * id string Review id
 * returns object
 **/
exports.reviewRetrieve = async function(id) {
  logger.info('[rest-api.ReviewApiService::reviewRetrieve] Retrieve review', { id });

  const data = await db.raw(`SELECT rowguid as id, productid, reviewername as name,
                                    emailaddress as email, rating, comments as review,
                                    status
                               FROM production.productreview
                              WHERE rowguid = :id`, {id});
  if (!data.rows.length) {
    throw new Error('Review not found');
  }

  return data.rows.pop();
}

/**
 * Updates review according to moderation results
 *
 * @param {Object} reply moderation details
 */
exports.updateModerationStatus = async function (reply) {
  logger.verbose('[rest-api.ReviewApiService::processModerationReply] Update review moderation status', { id: reply.id });

  let status;
  if (reply.appropriate) {
    status = 'published';
  } else {
    status = 'archived';
  }

  const data = await db.raw(`UPDATE production.productreview
                                SET status = :status,
                                    statusdate = now()
                              WHERE rowguid = :id
                                AND status = 'moderated'
                          RETURNING rowguid`, { id: reply.id, status });

  const review = data.rows.pop();

  if ('published' == status) {
    const notification = {
      id: review.rowguid
    }
    const options = {
      routingKey: config.get('app.notification.review.routingKey')
    }

    mq.publish(config.get('app.notification.review.exchange'), notification, options);
  }
  logger.info('[rest-api.ReviewApiService::processModerationReply] review status updated', { id: reply.id, status });

  return review;
}

/**
 * Retrieves unmoderated reviews and sets 'moderated' status
 *
 * @returns {Array<Object>} list of reviews to pass for moderation
 */
exports.fetchForModeration = async function () {
  logger.verbose('[rest-api.ReviewApiService::fetchForModeration] Retrieve reviews for moderation');

  const data = await db.raw(`UPDATE production.productreview
                                SET status = 'moderated',
                                    statusdate = now()
                              WHERE status = 'created'
                          RETURNING rowguid, comments`);

  return data.rows;
}

/**
 * Resets 'moderated' to 'created' for hung reviews
 *
 * @param {Number} timeout number of seconds to wait until review is considered hung
 * @returns {Array<Object>} list of reviews to pass for moderation
 */
exports.resetHungModeration = async function (timeout) {
  logger.verbose('[rest-api.ReviewApiService::resetHungModeration] Reset hung review status');

  const data = await db.raw(`UPDATE production.productreview
                                SET status = 'created',
                                    statusdate = now()
                              WHERE status = 'moderated'
                                AND extract(epoch from now() - statusdate) > :timeout
                          RETURNING rowguid`, {timeout});

  return data.rows;
}
