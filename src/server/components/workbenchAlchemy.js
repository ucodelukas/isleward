module.exports = {
	type: 'workbenchAlchemy',

	init: function (blueprint) {
		let o = this.obj.instance.objects.buildObjects([{
			properties: {
				x: this.obj.x - 1,
				y: this.obj.y - 1,
				width: 3,
				height: 3,
				cpnNotice: {
					actions: {
						enter: {
							cpn: 'workbenchAlchemy',
							method: 'enterArea',
							targetId: this.obj.id,
							args: []
						},
						exit: {
							cpn: 'workbenchAlchemy',
							method: 'exitArea',
							targetId: this.obj.id,
							args: []
						}
					}
				}
			}
		}]);
	},

	exitArea: function (obj) {
		if (!obj.player)
			return;

		obj.syncer.setArray(true, 'serverActions', 'removeActions', {
			key: 'u',
			action: {
				targetId: this.obj.id,
				cpn: 'workbenchAlchemy',
				method: 'access'
			}
		});

		this.obj.instance.syncer.queue('onCloseWorkbenchAlchemy', null, [obj.serverId]);
	},

	enterArea: function (obj) {
		if (!obj.player)
			return;

		let msg = 'Press U to access the alchemy station';

		obj.syncer.setArray(true, 'serverActions', 'addActions', {
			key: 'u',
			action: {
				targetId: this.obj.id,
				cpn: 'workbenchAlchemy',
				method: 'open'
			}
		});

		this.obj.instance.syncer.queue('onGetAnnouncement', {
			src: this.obj.id,
			msg: msg
		}, [obj.serverId]);
	},

	open: function (msg) {
		if (msg.sourceId == null)
			return;

		let obj = this.obj.instance.objects.objects.find(o => o.serverId === msg.sourceId);
		if ((!obj) || (!obj.player))
			return;

		let thisObj = this.obj;
		if ((Math.abs(thisObj.x - obj.x) > 1) || (Math.abs(thisObj.y - obj.y) > 1))
			return;

		this.obj.instance.syncer.queue('onOpenWorkbenchAlchemy', {
			workbenchId: this.obj.id
		}, [obj.serverId]);
	},

	craft: function(msg) {
		let potions = [{
			name: 'Lesser Healing Potion',
			type: 'consumable',
			sprite: [3, 1],
			spritesheet: 'server/mods/event-xmas/images/items.png',
			description: 'Sometimes you need an amount of health that exceeds the amount a Minor Healing Potion would afford but less than a regular Healing Potion would restore. This potion has you covered.',
			worth: 0,
			noSalvage: true,
			noAugment: true,
			uses: 1
		}];

		let obj = this.obj.instance.objects.objects.find(o => o.serverId === msg.sourceId);
		if ((!obj) || (!obj.player))
			return;

		obj.inventory.getItem(extend(true, {}, potions[0]));
	}
};
