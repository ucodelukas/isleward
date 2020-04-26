const events = require('../misc/events');

const tableNames = [
	'character',
	'characterList',
	'stash',
	'skins',
	'login',
	'leaderboard',
	'customMap',
	'mail',
	'customChannels',
	'error',
	'modLog',
	'accountInfo',
	'mtxStash'
];

events.emit('onBeforeGetTableNames', tableNames);

module.exports = tableNames;
