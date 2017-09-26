define([
	
], function(
	
) {
	return {
		name: 'Event: Halloween',

		mapOffset: {
			x: 10, 
			y: 10
		},

		extraScripts: [
			
		],

		mapFile: null,

		init: function() {
			this.mapFile = require('../' + this.relativeFolderName + '/maps/tutorial/map');

			this.events.on('onBeforeGetEventList', this.onBeforeGetEventList.bind(this));
			this.events.on('onBeforeGetQuests', this.onBeforeGetQuests.bind(this));
			this.events.on('onBeforeGetDialogue', this.onBeforeGetDialogue.bind(this));
			this.events.on('onAfterGetZone', this.onAfterGetZone.bind(this));
		},

		getLayerTile: function(info) {
			info.cell = 3;
		},

		onBeforeGetEventList: function(zone, list) {
			list.push(this.relativeFolderName + '/maps/tutorial/events/halloween.js');
		},

		onAfterGetZone: function(zone, config) {
			try {
				var modZone = require(this.relativeFolderName + '/maps/' + zone + '/zone.js');
				extend(true, config, modZone);
			} catch (e) {
				
			}
		},

		onBeforeGetDialogue: function(zone, config) {
			try {
				var modDialogue = require(this.relativeFolderName + '/maps/' + zone + '/dialogue.js');
				extend(true, config, modDialogue);
			} catch (e) {
				
			}
		},

		onBeforeGetQuests: function(zone, config) {
			try {
				var modQuests = require(this.relativeFolderName + '/maps/' + zone + '/quests.js');
				extend(true, config, modQuests);
			} catch (e) {
				
			}
		}
	};
});