let combat = require('../../combat/combat');

module.exports = {
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
		
		let inRange = true;
		if (this.has('range')) {
			let obj = this.obj;
			let distance = Math.max(Math.abs(target.x - obj.x), Math.abs(target.y - obj.y));
			inRange = (distance <= this.range);
		}
		return inRange;
	},

	castBase: function (action) {
		if (this.castTimeMax > 0) {
			if ((!this.currentAction) || (this.currentAction.target !== action.target)) {
				this.currentAction = action;

				let castEvent = {
					castTimeMax: this.castTimeMax
				};
				this.obj.fireEvent('beforeGetSpellCastTime', castEvent);

				this.currentAction.castTimeMax = castEvent.castTimeMax;
				this.castTime = castEvent.castTimeMax;
				this.obj.syncer.set(false, null, 'casting', 0);
			}

			return false;
		}

		return this.cast(action);
	},

	updateBase: function () {
		if (this.castTime > 0) {
			let action = this.currentAction;
			if (_.getDeepProperty(action, 'target.destroyed') || !this.canCast(action.target)) {
				this.currentAction = null;
				this.castTime = 0;
				this.obj.syncer.set(false, null, 'casting', 0);
				return;
			}

			this.castTime--;
			this.obj.syncer.set(false, null, 'casting', (action.castTimeMax - this.castTime) / action.castTimeMax);

			if (!this.castTime) {
				if (this.cast(action)) {
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
		let stats = this.obj.stats.values;
		stats.mana -= this.manaCost;

		if (this.obj.player)
			this.obj.syncer.setObject(true, 'stats', 'values', 'mana', stats.mana);
	},

	setCd: function () {
		let cd = {
			cd: this.cdMax
		};

		let isAttack = (this.type === 'melee');
		if ((Math.random() * 100) < this.obj.stats.values[isAttack ? 'attackSpeed' : 'castSpeed'])
			cd.cd = 1;

		this.obj.fireEvent('beforeSetSpellCooldown', cd, this);

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
		if ((!this.values) || (this.spellType === 'buff'))
			return;

		if ((!this.damage) && (!this.healing))
			delete this.values.dps;
		else {
			let noMitigate = !target;

			let dmg = combat.getDamage({
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

			let isAttack = (this.type === 'melee');

			let statValues = this.obj.stats.values;

			let critChance = isAttack ? statValues.attackCritChance : statValues.spellCritChance;
			let critMultiplier = isAttack ? statValues.attackCritMultiplier : statValues.spellCritMultiplier;
			let attackSpeed = (statValues.attackSpeed / 100);
			attackSpeed += 1;

			dmg = (((dmg / 100) * (100 - critChance)) + (((dmg / 100) * critChance) * (critMultiplier / 100))) * attackSpeed;
			let duration = this.values.duration;
			if (duration) 
				dmg *= duration;

			dmg /= this.cdMax;

			if (this.damage) 
				this.values.dmg = ~~(dmg * 100) / 100 + '/tick';
			else
				this.values.heal = ~~(dmg * 100) / 100 + '/tick';

			if (!noSync)
				this.obj.syncer.setArray(true, 'spellbook', 'getSpells', this.simplify());
		}
	},

	sendAnimation: function (blueprint) {
		this.obj.instance.syncer.queue('onGetObject', blueprint, -1);
	},

	sendBump: function (target, deltaX, deltaY) {
		if (target) {
			let x = this.obj.x;
			let y = this.obj.y;

			let tx = target.x;
			let ty = target.y;

			if (tx < x)
				deltaX = -1;
			else if (tx > x)
				deltaX = 1;

			if (ty < y)
				deltaY = -1;
			else if (ty > y)
				deltaY = 1;
		}

		let components = [{
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
		}, -1);
	},

	simplify: function (self) {
		let values = {};
		for (let p in this) {
			let value = this[p];
			if ((typeof (value) === 'function') || (p === 'obj') || (p === 'currentAction'))
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
		let config = {
			source: this.obj,
			target: target,
			damage: (this.damage || this.healing) * (this.dmgMult || 1),
			cd: this.cdMax,
			element: this.element,
			statType: this.statType,
			statMult: this.statMult,
			isAttack: (this.type === 'melee'),
			noMitigate: noMitigate
		};

		this.obj.fireEvent('onBeforeCalculateDamage', config);

		let damage = combat.getDamage(config);

		return damage;
	},

	queueCallback: function (callback, delay, destroyCallback, target, destroyOnRezone) {
		return this.obj.spellbook.registerCallback(this.obj.id, callback, delay, destroyCallback, target ? target.id : null, destroyOnRezone);
	},

	die: function () {
		this.obj.spellbook.unregisterCallback(this.obj.id);
	}
};
