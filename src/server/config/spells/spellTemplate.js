let spellCallbacks = require('./spellCallbacks');
let combat = require('../../combat/combat');

module.exports = {
	cd: 0,
	cdMax: 0,
	manaCost: 1,
	threatMult: 1,

	needLos: false,

	pendingAttacks: [],

	castBase: function () {
		if (this.cd > 0)
			return false;
		else if (this.manaCost > this.obj.stats.values.mana)
			return false;
		return true;
	},

	canCast: function (target) {
		if (this.cd > 0)
			return false;
		else if (this.manaCost > this.obj.stats.values.mana)
			return false;
		else if (!target)
			return true;
		
		let inRange = true;
		if (this.range !== null) {
			let obj = this.obj;
			let distance = Math.max(Math.abs(target.x - obj.x), Math.abs(target.y - obj.y));
			inRange = (distance <= this.range);
		}

		return inRange;
	},

	updateBase: function () {
		if (this.cd > 0)
			this.cd--;
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
			let critMultiplier = 100 + (isAttack ? statValues.attackCritMultiplier : statValues.spellCritMultiplier);
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

	sendBump: function (target) {
		let x = this.obj.x;
		let y = this.obj.y;

		let tx = target.x;
		let ty = target.y;

		let deltaX = 0;
		let deltaY = 0;

		if (tx < x)
			deltaX = -1;
		else if (tx > x)
			deltaX = 1;

		if (ty < y)
			deltaY = -1;
		else if (ty > y)
			deltaY = 1;

		let components = [{
			type: 'bumpAnimation',
			deltaX: deltaX,
			deltaY: deltaY
		}];

		if (this.animation) {
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
			if ((typeof (value) === 'function') || (p === 'obj'))
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
