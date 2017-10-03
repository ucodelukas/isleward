define([
	'globals',
	'server',
	'world/atlas',
	'components/components',
	'leaderboard/leaderboard',
	'security/io',
	'misc/mods',
	'mtx/mtx',
	'config/animations',
	'config/skins'
], function(
	globals,
	server,
	atlas,
	components,
	leaderboard,
	io,
	mods,
	mtx,
	animations,
	skins
) {
	return {
		init: function() {
			io.init(this.onDbReady.bind(this));
		},

		onDbReady: function() {
			setInterval(function() {
				global.gc();
			}, 60000);
			
			animations.init();
			mods.init(this.onModsLoaded.bind(this));
		},
		onModsLoaded: function() {
			globals.init();
			components.init(this.onComponentsReady.bind(this));
		},
		onComponentsReady: function() {
			skins.init();
			server.init(this.onServerReady.bind(this));
		},
		onServerReady: function() {
			atlas.init();
			leaderboard.init();
		}
	};
});