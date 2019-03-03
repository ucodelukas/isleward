let serverConfig = require('../config/serverConfig');

const useDb = process.env.db || serverConfig.db;

const moduleMap = {
	sqlite: 'Sqlite',
	rethinkdb: 'RethinkDb'
};
const modulePath = `./mail${moduleMap[useDb]}`;

module.exports = require(modulePath);
