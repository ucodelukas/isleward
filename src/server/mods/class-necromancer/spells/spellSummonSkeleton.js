define([
	'world/mobBuilder'
], function(
	mobBuilder
) {
	return {
		type: 'summonSkeleton',

		targetGround: true,

		cdMax: 7,
		manaCost: 0,

		range: 9,

		needLos: true,

		minions: [],

		cast: function(action) {
			var currentMinion = this.minions[0];
			if (currentMinion) {
				currentMinion.destroyed = true;
				this.minions = [];

				this.obj.syncer.queue('onGetObject', {
					x: currentMinion.x,
					y: currentMinion.y,
					components: [{
						type: 'attackAnimation',
						row: 0,
						col: 4
					}]
				});
			}

			var obj = this.obj;
			var target = action.target;

			//Spawn a mob
			var mob = obj.instance.spawners.spawn({
				amountLeft: 1,
				blueprint: {
					x: target.x,
					y: target.y,
					cell: 0,
					sheetName: `${this.folderName}/images/mobs.png`,
					name: 'Skeletal Minion',
					properties: {
						cpnFollower: {
							maxDistance: 3
						}
					},
					extraProperties: {
						follower: {
							master: obj
						}
					}
				}
			});

			mobBuilder.build(mob, {
				level: 1,
				faction: obj.aggro.faction,
				walkDistance: 2,
				regular: {
					drops: 0,
					hpMult: 1,
					dmgMult: 1
				},
				spells: [{
					type: 'melee',
					damage: 1,
					statMult: 0.1
				}]
			}, false, 'regular');

			mob.follower.bindEvents();

			this.minions.push(mob);

			return true;
		},

		update: function() {
			var minions = this.minions;
			var mLen = minions.length;
			for (var i = 0; i < mLen; i++) {
				var m = minions[i];
				if (m.destroyed) {
					minions.splice(i, 1);
					i--;
					mLen--;
				}
			}
		}
	};
});