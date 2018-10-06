let components = [
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
	'quests',
	'events',
	'resourceNode',
	'gatherer',
	'stash',
	'flash',
	'chatter',
	'dialogue',
	'trade',
	'reputation',
	'serverActions',
	'social',
	'passives',
	'sound'
].map(function (c) {
	return 'js/components/' + c;
});

define(components, function () {
	let templates = {};

	[].forEach.call(arguments, function (t) {
		templates[t.type] = t;
	});

	return {
		getTemplate: function (type) {
			if (type === 'lightpatch')
				type = 'lightPatch';

			let template = templates[type] || {
				type: type
			};

			return template;
		}
	};
});
