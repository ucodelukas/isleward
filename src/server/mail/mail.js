let serverConfig = require('../config/serverConfig');

//eslint-disable-next-line no-process-env
const useDb = process.env.db || serverConfig.db;

const moduleMap = {
	sqlite: 'Sqlite',
	rethink: 'RethinkDb'
};
const modulePath = `./mail${moduleMap[useDb]}`;

module.exports = require(modulePath);
