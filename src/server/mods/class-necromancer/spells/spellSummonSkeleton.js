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

		cast: function(action) {
			var obj = this.obj;
			var target = action.target;

			//Spawn a mob
			var mob = obj.instance.spawners.spawn({
				amountLeft: 1,
				blueprint: {
					x: target.x,
					y: target.y,
					cell: 0,
					spriteSheet: `${this.folderName}/images/mobs.png`,
					name: 'Skeletal Minion',
					properties: {
						cpnFollower: {}
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

			return true;
		}
	};
});