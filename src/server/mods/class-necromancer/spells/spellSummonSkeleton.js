define([
	'world/mobBuilder',
	'config/animations'
], function(
	mobBuilder,
	animations
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

				var deathAnimation = _.getDeepProperty(animations, ['mobs', currentMinion.sheetName, currentMinion.cell, 'death']);
				if (deathAnimation) {
					this.obj.instance.syncer.queue('onGetObject', {
						x: currentMinion.x,
						y: currentMinion.y,
						components: [deathAnimation]
					});
				} else {
					this.obj.instance.syncer.queue('onGetObject', {
						x: currentMinion.x,
						y: currentMinion.y,
						components: [{
							type: 'attackAnimation',
							row: 0,
							col: 4
						}]
					});
				}
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
				level: obj.stats.values.level,
				faction: obj.aggro.faction,
				walkDistance: 2,
				regular: {
					drops: 0,
					hpMult: 0.5,
					dmgMult: 2
				},
				spells: [{
					type: 'melee',
					damage: 1,
					statMult: 0.2
				}]
			}, false, 'regular');
			mob.stats.values.regenHp = mob.stats.values.hpMax / 100;

			var spell = mob.spellbook.spells[0];
			spell.statType = ['str', 'int'];
			mob.stats.values.str = obj.stats.values.str;
			mob.stats.values.int = obj.stats.values.int;
			spell.threatMult *= 10;

			mob.follower.bindEvents();

			this.minions.push(mob);

			this.sendBump({
				x: obj.x,
				y: obj.y - 1
			});

			if (this.animation) {
				this.obj.instance.syncer.queue('onGetObject', {
					id: this.obj.id,
					components: [{
						type: 'animation',
						template: this.animation
					}]
				});
			}

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
		},

		onAfterSimplify: function(simple) {
			delete simple.minions;
		}
	};
});