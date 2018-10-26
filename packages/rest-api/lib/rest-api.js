'use strict';

const path = require('path');
const scheduler = require('utils').cron;

scheduler.init(path.dirname(__dirname)).catch(process.exit);
