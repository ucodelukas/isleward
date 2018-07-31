/* global io, extend, cons, _, atlas, leaderboard, clientConfig */

global.io = require('./security/io');
global.extend = require('extend');
global.cons = require('./security/connections');
global._ = require('./misc/helpers');
global.atlas = require('./world/atlas');
global.leaderboard = require('./leaderboard/leaderboard');
global.clientConfig = require('./config/clientConfig');

clientConfig.init();
