'use strict';

const db = require('utils').db;
const logger = require('utils').logger;

/**
 * Retrieve products
 * Get a list of products ids and titles
 *
 * returns object
 **/
exports.productList = async function() {
  logger.info('[ProductApiService::productList] Retrieve product and reviews');
  const data = await db.raw(`SELECT p.productid id,
                                p.name,
                                r.reviewername,
                                r.comments review,
                                r.reviewdate
                           FROM production.product p
                      LEFT JOIN production.productreview r
                             ON r.productid = p.productid
                            AND r.status = 'published'
                          ORDER BY reviewdate DESC NULLS LAST
                          LIMIT 10`);

  const result = data.rows.reduce((p, c) => {
      if (!p[c.id]) {
        p['_' + c.id] = {
          id: c.id,
          name: c.name,
          reviews: []
        }
      }

      if (c.reviewername) {
        p['_' + c.id].reviews.push({
          name: c.reviewername,
          review: c.review
        });
      }

      return p;
    }, {});

  logger.debug('[ProductApiService::productList] Retrieved products', {count: Object.keys(result).length});

  return {
    list: Object.values(result)
  };
}


/**
 * Product info
 * Retrieves single product and associated reviews
 *
 * id integer Product id
 * returns object
 **/
exports.productRetrieve = async function(id) {
  logger.info('[ProductApiService::productRetrieve] Retrieve product and reviews', {id});
  const data = await db.raw(`SELECT p.productid id,
                                p.name,
                                p.productnumber number,
                                r.reviewername,
                                r.comments review
                           FROM production.product p
                      LEFT JOIN production.productreview r
                             ON r.productid = p.productid
                            AND r.status = 'published'
                          WHERE p.productid = :id`, { id });
  if (!data.rows.length) {
    logger.warn('[ProductApiService::productRetrieve] Product not found', {id});
    throw new Error('No found');
  }

  const result = data.rows.reduce((p, c) => {
      if (!p[c.id]) {
        p[c.id] = {
          id: c.id,
          name: c.name,
          number: c.number,
          reviews: []
        }
      }

      if (c.reviewername) {
        p[c.id].reviews.push({
          name: c.reviewername,
          review: c.review
        });
      }

      return p;
    }, {});

  logger.debug('[ProductApiService::productRetrieve] Retrieved products', {count: Object.keys(result).length});

  return Object.values(result).pop();
}
