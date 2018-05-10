define([
	'config/spells/spellCallbacks',
	'combat/combat'
], function (
	spellCallbacks,
	combat
) {
	return {
		cd: 0,
		cdMax: 0,
		manaCost: 1,
		threatMult: 1,

		casting: false,
		castTime: 0,
		castTimeMax: 0,

		needLos: false,

		currentAction: null,

		pendingAttacks: [],

		canCast: function (target) {
			if (this.cd > 0)
				return false;
			else if (this.manaCost > this.obj.stats.values.mana)
				return false;
			else if (!target)
				return true;
			else {
				var inRange = true;
				if (this.range != null) {
					var obj = this.obj;
					var distance = Math.max(Math.abs(target.x - obj.x), Math.abs(target.y - obj.y));
					inRange = (distance <= this.range);
				}

				return inRange;
			}
		},

		castBase: function (action) {
			if (this.castTimeMax > 0) {
				if ((!this.currentAction) || (this.currentAction.target != action.target)) {
					this.currentAction = action;
					this.castTime = this.castTimeMax;
					this.obj.syncer.set(false, null, 'casting', 0);
				}

				return false;
			}

			return this.cast(action);
		},

		updateBase: function () {
			if (this.castTime > 0) {
				this.castTime--;
				this.obj.syncer.set(false, null, 'casting', (this.castTimeMax - this.castTime) / this.castTimeMax);

				if (!this.castTime) {
					if (this.cast(this.currentAction)) {
						this.consumeMana();
						this.setCd();
						this.currentAction = null;
					}
				} else
					this.sendBump(null, 0, -1);

				return;
			}

			if (this.cd > 0)
				this.cd--;
		},

		consumeMana: function () {
			var stats = this.obj.stats.values;
			stats.mana -= this.manaCost;

			if (this.obj.player)
				this.obj.syncer.setObject(true, 'stats', 'values', 'mana', stats.mana);
		},

		setCd: function () {
			var cd = {
				cd: this.cdMax
			};

			var isAttack = (this.type == 'melee');
			if ((Math.random() * 100) < this.obj.stats.values[isAttack ? 'attackSpeed' : 'castSpeed'])
				cd.cd = 1;

			this.obj.fireEvent('beforeSetSpellCooldown', cd);

			this.cd = cd.cd;

			if (this.obj.player) {
				this.obj.instance.syncer.queue('onGetSpellCooldowns', {
					id: this.obj.id,
					spell: this.id,
					cd: (this.cd * 350)
				}, [this.obj.serverId]);
			}
		},

		calcDps: function (target, noSync) {
			if ((!this.values) || (this.spellType == 'buff'))
				return;

			if ((!this.damage) && (!this.healing))
				delete this.values.dps;
			else {
				var noMitigate = !target;

				var dmg = combat.getDamage({
					source: this.obj,
					target: (target || {
						stats: {
							values: {}
						}
					}),
					damage: (this.damage || this.healing) * (this.dmgMult || 1),
					cd: this.cdMax,
					element: this.element,
					statType: this.statType,
					statMult: this.statMult,
					noMitigate: noMitigate,
					noCrit: true
				}).amount;

				var isAttack = (this.type == 'melee');

				var statValues = this.obj.stats.values;

				var critChance = isAttack ? statValues.attackCritChance : statValues.spellCritChance;
				var critMultiplier = isAttack ? statValues.attackCritMultiplier : statValues.spellCritMultiplier;
				var attackSpeed = (statValues.attackSpeed / 100);
				attackSpeed += 1;

				dmg = (((dmg / 100) * (100 - critChance)) + (((dmg / 100) * critChance) * (critMultiplier / 100))) * attackSpeed;
				var duration = this.values.duration;
				if (duration) {
					dmg *= duration;
				}

				dmg /= this.cdMax;

				if (this.damage) {
					this.values.dmg = ~~(dmg * 100) / 100 + '/tick';
				} else
					this.values.heal = ~~(dmg * 100) / 100 + '/tick';

				if (!noSync)
					this.obj.syncer.setArray(true, 'spellbook', 'getSpells', this.simplify());
			}
		},

		sendAnimation: function (blueprint) {
			this.obj.instance.syncer.queue('onGetObject', blueprint);
		},

		sendBump: function (target, deltaX, deltaY) {
			if (target) {
				var x = this.obj.x;
				var y = this.obj.y;

				var tx = target.x;
				var ty = target.y;

				if (tx < x)
					deltaX = -1;
				else if (tx > x)
					deltaX = 1;

				if (ty < y)
					deltaY = -1;
				else if (ty > y)
					deltaY = 1;
			}

			var components = [{
				type: 'bumpAnimation',
				deltaX: deltaX,
				deltaY: deltaY
			}];

			//During casting we only bump
			if ((target) && (this.animation)) {
				components.push({
					type: 'animation',
					template: this.animation
				});
			}

			this.obj.instance.syncer.queue('onGetObject', {
				id: this.obj.id,
				components: components
			});
		},

		simplify: function (self) {
			var values = {};
			for (var p in this) {
				var value = this[p];
				if ((typeof (value) == 'function') || (p == 'obj'))
					continue;

				values[p] = value;
			}

			if (this.animation)
				values.animation = this.animation.name;
			if (this.values)
				values.values = this.values;

			if (this.onAfterSimplify)
				this.onAfterSimplify(values);

			return values;
		},

		getDamage: function (target, noMitigate) {
			var damage = {
				source: this.obj,
				target: target,
				damage: (this.damage || this.healing) * (this.dmgMult || 1),
				cd: this.cdMax,
				element: this.element,
				statType: this.statType,
				statMult: this.statMult,
				isAttack: (this.type == 'melee'),
				noMitigate: noMitigate
			};

			this.obj.fireEvent('onBeforeCalculateDamage', damage);

			var damage = combat.getDamage(damage);

			return damage;
		},

		queueCallback: function (callback, delay, destroyCallback, target, destroyOnRezone) {
			return this.obj.spellbook.registerCallback(this.obj.id, callback, delay, destroyCallback, target ? target.id : null, destroyOnRezone);
		},

		die: function () {
			this.obj.spellbook.unregisterCallback(this.obj.id);
		}
	};
});
