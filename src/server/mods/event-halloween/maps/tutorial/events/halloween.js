define([
	'mtx/mtx',

], function (
	mtx
) {
	var dropsConfig = {
		//mtx
		summonPumpkinSkeleton: {
			name: 'Summon Pumpkin Skeleton',
			type: 'mtx',
			effects: [{
				mtx: 'summonPumpkinSkeleton'
			}],
			spritesheet: `FOLDERNAME/images/items.png`,
			sprite: [3, 0],
			noDrop: true,
			noDestroy: true,
			noSalvage: true
		},

		hauntedIceSpear: {
			name: 'Haunted Ice Spear',
			type: 'mtx',
			effects: [{
				mtx: 'hauntedIceSpear'
			}],
			spritesheet: `FOLDERNAME/images/items.png`,
			sprite: [3, 0],
			noDrop: true,
			noDestroy: true,
			noSalvage: true
		}
	};

	var gatherDrops = {
		summonPumpkinSkeleton: 0.001,
		hauntedIceSpear: 0.001
	};

	return {
		name: `Soul's Moor`,
		description: `The Pumpkin Sailor has returned to the shores of the living.`,
		distance: -1,
		cron: '* * * * *',

		events: {

		},

		helpers: {

		},

		phases: [{
			type: 'hookEvents',
			events: {
				beforeGatherResource: function (gatherResult, gatherer) {
					var itemName = gatherResult.blueprint.itemName;
					if ((!itemName) || (itemName.toLowerCase() != 'candy corn'))
						return;

					gatherer.reputation.getReputation('pumpkinSailor', 50);

					//Spawn a Nibbler?
					if (Math.random() < 0.1) {
						var obj = gatherResult.obj;
						var spellbook = obj.spellbook;
						if (!spellbook) {
							spellbook = obj.addComponent('spellbook');
							spellbook.addSpell('summonSkeleton');
							var spell = spellbook.spells[0];
							spell.killMinionsOnDeath = false;
							spell.hpPercent = 100;
							spell.damagePercent = 100;

							obj.addComponent('stats', {
								values: {
									hpMax: 500,
									hp: 500,
									str: 150 * 8,
									level: 5
								}
							});

							obj.addComponent('aggro', {
								faction: 'lordSquash'
							});
						}

						var pos = obj.instance.physics.getClosestPos(obj.x, obj.y, obj.x, obj.y);
						spellbook.spells[0].cast({
							target: {
								x: pos.x,
								y: pos.y
							}
						});
						var summoned = spellbook.spells[0].minions[0];
						summoned.name = 'Soul Nibbler';
						summoned.aggro.list.push({
							obj: gatherer,
							threat: 1
						});

						summoned.sheetName = 'server/mods/event-halloween/images/mobs.png';
						summoned.cell = 0;

						summoned.inventory.blueprint = {
							noRandom: true,
							rolls: 2,
							chance: 100,
							blueprints: [{
								chance: 5,
								name: 'Summon Pumpkin Skeleton',
								type: 'mtx',
								effects: [{
									mtx: 'summonPumpkinSkeleton'
								}],
								spritesheet: `server/mods/event-halloween/images/items.png`,
								sprite: [3, 0],
								noDrop: true,
								noDestroy: true,
								noSalvage: true
							}, {
								chance: 100,
								name: 'Candy Corn',
								spritesheet: `server/mods/event-halloween/images/items.png`,
								material: true,
								sprite: [3, 3],
								quantity: [1, 5]
							}]
						};
					}

					for (var g in gatherDrops) {
						if (Math.random() < gatherDrops[g]) {
							var drop = extend(true, {}, dropsConfig[g]);
							drop.spritesheet = drop.spritesheet.replace('FOLDERNAME', this.event.config.folderName);

							if (drop.effects) {
								var mtxUrl = mtx.get(drop.effects[0].mtx);
								var mtxModule = require(mtxUrl);

								drop.effects[0].events = mtxModule.events;

								gatherResult.items.push(drop);

								return;
							}
						}
					}
				}
			}
		}]
	};
});
