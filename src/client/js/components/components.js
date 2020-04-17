const templates = {};
const eventList = {};

let events = null;

const hookEvent = function (e, cb) {
	if (!eventList[e])
		eventList[e] = [];

	eventList[e].push(cb);
	events.on(e, cb);
};

const unhookEvents = function () {
	Object.entries(eventList).forEach(([eventName, callbacks]) => {
		callbacks.forEach(c => events.off(eventName, c));
	});
};

const componentPaths = [
	'animation',
	'attackAnimation',
	'bumpAnimation',
	'chatter',
	'chest',
	'dialogue',
	'effects',
	'events',
	'explosion',
	'flash',
	'inventory',
	'keyboardMover',
	'light',
	'lightningEffect',
	'lightPatch',
	'mouseMover',
	'moveAnimation',
	'particles',
	'passives',
	'pather',
	'player',
	'projectile',
	'quests',
	'reputation',
	'serverActions',
	'social',
	'sound',
	'spellbook',
	'stash',
	'stats',
	'touchMover',
	'trade',
	'whirlwind'
].map(c => 'js/components/' + c);

define([
	'../system/events',
	'../system/globals'
], function (
	eventModule,
	globals
) {
	events = eventModule;

	return {
		init: async function () {
			const extraComponents = globals.clientConfig.components;
			componentPaths.push(...extraComponents);

			await Promise.all(componentPaths.map(path => {
				return new Promise(async res => {
					require([path], cpn => {
						cpn.eventList = {};
						cpn.hookEvent = hookEvent.bind(cpn);
						cpn.unhookEvents = unhookEvents.bind(cpn);

						templates[cpn.type] = cpn;

						res();
					});
				});
			}));
		},

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
