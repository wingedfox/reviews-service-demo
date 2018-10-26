'use strict';
const config = require('./config');
const CronJob = require('cron').CronJob;
const logger = require('./logger');

const CONFIG_CRONJOB_KEY='cron.job';

/**
 * Initializes scheduled tasks
 *
 * @param {String} root root dir to get controllers from
 */
async function initSchedulers (root) {
  logger.info('[utils::cron.initSchedulers] initialize schedulers');

  const cronjobs = config.get(CONFIG_CRONJOB_KEY);
  for (let cronjob of cronjobs) {
    try {
      const ctrl = require(root + '/lib/controllers/cron/' + cronjob.controller);
      new CronJob(cronjob.schedule, ctrl, null, true);

      logger.info('[utils::cron.initSchedulers] scheduler started', {cron: cronjob});
    } catch (err) {
      logger.error('[utils::cron.initSchedulers] scheduler could not be started', {error: err, cron: cronjob});
    }
  }
}

module.exports.init = initSchedulers;
