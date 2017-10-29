define([
	'config/animations',
	'items/generator',
	'combat/combat'
], function (
	animations,
	itemGenerator,
	combat
) {
	return {
		build: function (mob, blueprint, scaleDrops, type) {
			var typeDefinition = blueprint[type] || blueprint;

			var drops = typeDefinition.drops;

			mob.isMob = true;
			mob.scaleDrops = scaleDrops;

			if (blueprint.nonSelectable)
				mob.nonSelectable = true;

			mob.addComponent('effects');
			if (type) {
				if (type != 'regular') {
					mob.effects.addEffect({
						type: type
					});

					mob['is' + type[0].toUpperCase() + type.substr(1)] = true;

					mob.baseName = mob.name;
					mob.name = typeDefinition.name || mob.baseName;
				}
			}

			mob.addComponent('stats', {
				values: {
					level: blueprint.level
				}
			});

			var cpnMob = mob.addComponent('mob');
			cpnMob.walkDistance = blueprint.walkDistance;
			cpnMob.hpMult = blueprint.hpMult || typeDefinition.hpMult;
			cpnMob.dmgMult = blueprint.dmgMult || typeDefinition.dmgMult;
			cpnMob.grantRep = blueprint.grantRep;
			cpnMob.deathRep = blueprint.deathRep;

			var spells = extend(true, [], blueprint.spells);
			spells.forEach(function (s) {
				if (!s.animation) {
					if ((mob.sheetName == 'mobs') && (animations.mobs[mob.cell])) {
						s.animation = 'basic';
					}
				}
			});

			mob.addComponent('spellbook', {
				spells: spells,
				dmgMult: typeDefinition.dmgMult
			});

			var attackable = blueprint.attackable;
			if ((attackable === undefined) || (attackable === true)) {
				mob.addComponent('aggro', {
					faction: blueprint.faction
				});
			}

			mob.addComponent('equipment');
			mob.addComponent('inventory', drops);
			mob.inventory.inventorySize = -1;

			if (this.zone) {
				var chats = this.zone.chats;
				if ((chats) && (chats[mob.name.toLowerCase()])) {
					mob.addComponent('chatter', {
						chats: chats[mob.name.toLowerCase()]
					});
				}

				var dialogues = this.zone.dialogues;
				if ((dialogues) && (dialogues[mob.name.toLowerCase()])) {
					mob.addComponent('dialogue', {
						config: dialogues[mob.name.toLowerCase()]
					});
				}
			}

			if ((blueprint.properties) && (blueprint.properties.cpnTrade))
				mob.addComponent('trade', blueprint.properties.cpnTrade);

			this.scale(mob, blueprint.level);
		},

		scale: function (mob, level) {
			if ((mob.aggro) && (mob.aggro.list > 0))
				return;

			var drops = mob.inventory.blueprint || {};

			var statValues = mob.stats.values;

			var preferStat = ['str', 'dex', 'int'][~~(Math.random() * 3)];
			var elementType = ['physical', 'poison', 'frost', 'fire', 'holy', 'arcane'][~~(Math.random() * 6)];

			mob.equipment.unequipAll();
			mob.inventory.clear();

			var hp = 10 + (level * 120);
			statValues.hpMax = hp;

			statValues.level = level;

			if ((!drops.blueprints) || (drops.alsoRandom)) {
				[
					'head',
					'chest',
					'neck',
					'hands',
					'waist',
					'legs',
					'feet',
					'finger',
					'trinket',
					'twoHanded'
				].forEach(function (slot) {
					var item = itemGenerator.generate({
						noSpell: true,
						level: level,
						slot: slot,
						forceStats: [preferStat]
					});
					delete item.spell;
					mob.inventory.getItem(item);
					mob.equipment.autoEquip(item.id);
				}, this);
			} else {
				//TODO: Don't give the mob these items: he'll drop them anyway
				drops.blueprints.forEach(function (d) {
					var drop = extend(true, {}, d);
					d.level = level;
					mob.inventory.getItem(itemGenerator.generate(drop));
				}, this);
			}

			var spellCount = (mob.isRare ? 1 : 0) + (mob.isChampion ? 2 : 0);

			for (var i = 0; i < spellCount; i++) {
				var rune = itemGenerator.generate({
					spell: true
				});
				rune.eq = true;
				if (i == 0)
					rune.spell.cdMult = 5;
				mob.inventory.getItem(rune);
			}

			var dmgMult = 4 * mob.mob.dmgMult;
			var hpMult = 1 * mob.mob.hpMult;

			if (level < 10) {
				hpMult *= [0.005, 0.01, 0.035, 0.08, 0.16, 0.28, 0.43, 0.62, 0.8][level - 1];
				dmgMult *= [0.1, 0.2, 0.4, 0.7, 1, 1, 1, 1, 1][level - 1];
			}

			if (mob.isRare) {
				dmgMult *= 1.25;
				hpMult *= 1.25;
			}

			if (mob.isChampion) {
				dmgMult *= 2;
				hpMult *= 3;
			}

			statValues.hpMax *= hpMult;
			statValues.hp = statValues.hpMax;
			statValues.mana = statValues.manaMax;

			mob.spellbook.spells.forEach(function (s, i) {
				s.dmgMult = dmgMult;
				s.statType = preferStat;
				s.element = elementType;
				s.manaCost = 0;

				/*var damage = combat.getDamage({
					source: mob,
					target: mob,
					damage: (s.damage || s.healing) * (s.dmgMult || 1),
					cd: s.cdMax,
					element: s.element,
					statType: s.statType,
					statMult: s.statMult,
					noMitigate: false,
					noCrit: true
				});*/
			}, this);

			['hp', 'hpMax', 'mana', 'manaMax', 'level'].forEach(function (s) {
				mob.syncer.setObject(false, 'stats', 'values', s, statValues[s]);
			});
		}
	};
});
