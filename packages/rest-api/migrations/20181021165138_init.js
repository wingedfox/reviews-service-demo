'use strict';
const path = require('path');
const fs = require('fs');

const migration_up = path.format({dir: path.join(__dirname, 'ddl/up'), name: path.basename(__filename, '.js'), ext: '.sql'});
const migration_down = path.format({dir: path.join(__dirname, 'ddl/down'), name: path.basename(__filename, '.js'), ext: '.sql'});

exports.up = function(knex, Promise) {
  return knex.raw(fs.readFileSync(migration_up, 'utf-8'));
};

exports.down = function(knex, Promise) {
  return knex.raw(fs.readFileSync(migration_down, 'utf-8'));
};
