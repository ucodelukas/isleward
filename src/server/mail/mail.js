const moduleMap = {
	sqlite: 'Sqlite',
	rethinkdb: 'RethinkDb'
};
const modulePath = `./mail${moduleMap[consts.db]}`;

module.exports = require(modulePath);
