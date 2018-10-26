'use strict';

const rpc = require('utils').mq.rpc.server;
const path = require('path');

rpc.initRpcServer(path.dirname(__dirname)).catch(process.exit);
