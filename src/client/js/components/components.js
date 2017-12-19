var components = [
	'keyboardMover',
	'mouseMover',
	'player',
	'pather',
	'attackAnimation',
	'lightningEffect',
	'moveAnimation',
	'bumpAnimation',
	'animation',
	'light',
	'lightPatch',
	'projectile',
	'particles',
	'explosion',
	'spellbook',
	'inventory',
	'stats',
	'chest',
	'effects',
	'aggro',
	'quests',
	'events',
	'resourceNode',
	'gatherer',
	'stash',
	'flash',
	'chatter',
	'dialogue',
	'trade',
	'prophecies',
	'reputation',
	'serverActions',
	'social'
].map(function(c) {
	return 'js/components/' + c;
});

define(components, function() {
	var templates = {};

	[].forEach.call(arguments, function(t) {
		templates[t.type] = t;
	});

	return {
		getTemplate: function(type) {
			if (type == 'lightpatch')
				type = 'lightPatch';
			
			return templates[type];
		}
	};
});