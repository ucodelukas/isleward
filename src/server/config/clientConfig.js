const events = require('../misc/events');
const tos = require('./tos');

const config = {
	logoPath: null,
	resourceList: [],
	textureList: [
		'tiles',
		'walls',
		'mobs',
		'bosses',
		'animBigObjects',
		'bigObjects',
		'objects',
		'characters',
		'attacks',
		'ui',
		'auras',
		'animChar',
		'animMob',
		'animBoss',
		'white',
		'ray',
		'images/skins/0001.png',
		'images/skins/0010.png',
		'images/skins/0012.png'
	],
	//Textures that are 24x24. The renderer needs to know this
	bigTextures: [
		'animBigObjects',
		'bigObjects',
		'bosses'
	],
	atlasTextures: [
		'tiles',
		'walls',
		'objects'
	],
	uiLoginList: [
		'login'
	],
	uiList: [
		'inventory',
		'equipment',
		'hud',
		'target',
		'menu',
		'spells',
		'messages',
		'online',
		'mainMenu',
		'context',
		'party',
		'help',
		'dialogue',
		'buffs',
		'tooltips',
		'tooltipInfo',
		'tooltipItem',
		'announcements',
		'quests',
		'events',
		'progressBar',
		'stash',
		'talk',
		'trade',
		'overlay',
		'death',
		'leaderboard',
		'reputation',
		'mail',
		'wardrobe',
		'passives',
		'workbench',
		'middleHud',
		'options'
	],
	contextMenuActions: {
		player: [],
		npc: []
	},
	sounds: {
		ui: []
	},
	tos
};

module.exports = {
	init: function () {
		events.emit('onBeforeGetClientConfig', config);

		//Deprecated
		events.emit('onBeforeGetResourceList', config.resourceList);
		events.emit('onBeforeGetUiList', config.uiList);
		events.emit('onBeforeGetContextMenuActions', config.contextMenuActions);
		events.emit('onBeforeGetTermsOfService', config.tos);
		events.emit('onBeforeGetTextureList', config.textureList);
	},

	//Used to send to clients
	getClientConfig: function (msg) {
		msg.callback(config);
	},

	//Just used by the server
	get: function () {
		return config;
	}
};
