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

					gatherer.reputation.getReputation('pumpkinSailor', 40);

					//Spawn a Nibbler?
					var roll = Math.random();
					if (roll < 0.15) {
						var obj = gatherResult.obj;
						var spellbook = obj.spellbook;
						if (!spellbook) {
							spellbook = obj.addComponent('spellbook');
							spellbook.addSpell('summonSkeleton');
							var spell = spellbook.spells[0];
							spell.killMinionsOnDeath = false;
							spell.hpPercent = 100;
							spell.damagePercent = 100;

							var level = gatherer.stats.values.level;
							var hp = ((level * 15) + level) * 2;
							var str = ((level * 14.9) + ((level - 1) * 31.49));
							if (level < 10)
								str *= [0.1, 0.2, 0.4, 0.7, 1, 1, 1, 1, 1][level - 1];

							obj.addComponent('stats', {
								values: {
									hpMax: hp,
									hp: hp,
									str: str * 1.2,
									level: level
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
								chance: 4.5,
								name: 'Summon Pumpkin Skeleton',
								type: 'mtx',
								effects: [{
									mtx: 'summonPumpkinSkeleton'
								}],
								spritesheet: `server/mods/event-halloween/images/items.png`,
								sprite: [3, 0],
								noSpell: true,
								noDrop: true,
								noDestroy: true,
								noSalvage: true
							}, {
								chance: 100,
								name: 'Candy Corn',
								spritesheet: `server/mods/event-halloween/images/items.png`,
								material: true,
								noSpell: true,
								sprite: [3, 3],
								quantity: [1, 5]
							}]
						};
					}
				}
			}
		}]
	};
});
