module.exports = {
	type: 'aggro',

	range: 7,
	faction: null,

	physics: null,

	list: [],
	ignoreList: [],

	init: function (blueprint) {
		this.physics = this.obj.instance.physics;

		blueprint = blueprint || {};

		if (blueprint.faction) 
			this.faction = blueprint.faction;

		//TODO: Why don't we move if faction is null?
		if (this.faction == null)
			return;

		if (this.physics.width > 0)
			this.move();
		else {
			//HACK: Don't fire on main thread (no physics set up)
			console.log('HACK: cpn/aggro');
		}
	},

	events: {
		beforeRezone: function () {
			this.die();
		}
	},

	simplify: function (self) {
		return {
			type: 'aggro',
			faction: this.faction
		};
	},

	move: function () {
		if (this.obj.dead)
			return;

		let result = {
			success: true
		};
		this.obj.fireEvent('beforeAggro', result);
		if (!result.success)
			return;

		let obj = this.obj;

		//If we're attacking something, don't try and look for more trouble. SAVE THE CPU!
		// this only counts for mobs, players can have multiple attackers
		let list = this.list;
		if (obj.isMob) {
			var lLen = list.length;
			for (var i = 0; i < lLen; i++) {
				let l = list[i];

				var lThreat = l.obj.aggro.getHighest();
				if (lThreat) {
					l.obj.aggro.list.forEach(function (a) {
						a.obj.aggro.unIgnore(lThreat);
					});
				}

				l.obj.aggro.unIgnore(obj);
				if (l.threat > 0)
					return;
			}
		} else {
			var lLen = list.length;
			for (var i = 0; i < lLen; i++) {
				let targetAggro = list[i].obj.aggro;
				//Maybe the aggro component has been removed?
				if (targetAggro)
					targetAggro.unIgnore(obj);
			}
		}

		let x = obj.x;
		let y = obj.y;

		//find mobs in range
		let range = this.range;
		let faction = this.faction;
		let inRange = this.physics.getArea(x - range, y - range, x + range, y + range, (c => (((!c.player) || (!obj.player)) && (!obj.dead) && (c.aggro) && (c.aggro.willAutoAttack(obj)))));

		if (inRange.length == 0)
			return;

		let iLen = inRange.length;
		for (var i = 0; i < iLen; i++) {
			let enemy = inRange[i];

			//The length could change
			lLen = list.length;
			for (let j = 0; j < lLen; j++) {
				//Set the enemy to null so we need we need to continue
				if (list[j].obj == enemy)
					enemy = null;
			}
			if (!enemy)
				continue;

			//Do we have LoS?
			if (!this.physics.hasLos(x, y, enemy.x, enemy.y))
				continue;

			if (enemy.aggro.tryEngage(obj))
				this.tryEngage(enemy, 0);
		}
	},

	canAttack: function (target) {
		let obj = this.obj;
		if (target == obj)
			return false;
		else if ((target.player) && (obj.player)) {
			let hasButcher = (obj.prophecies.hasProphecy('butcher')) && (target.prophecies.hasProphecy('butcher'));

			if ((!target.social.party) || (!obj.social.party))
				return hasButcher;
			else if (target.social.partyLeaderId != obj.social.partyLeaderId)
				return hasButcher;
			return false;
		} else if ((target.follower) && (target.follower.master.player) && (obj.player))
			return false;
		else if (obj.player)
			return true;
		else if (target.aggro.faction != obj.aggro.faction)
			return true;
		else if (!!target.player != !!obj.player)
			return true;
	},

	willAutoAttack: function (target) {
		if (this.obj == target)
			return false;

		let faction = target.aggro.faction;
		if ((faction == null) || (!this.faction))
			return false;

		let rep = this.obj.reputation;
		if (!rep) {
			let targetRep = target.reputation;
			if (!targetRep)
				return false;
			return (targetRep.getTier(this.faction) < 3);
		}

		return (rep.getTier(faction) < 3);
	},

	ignore: function (obj) {
		this.ignoreList.spliceWhere(o => o == obj);
		this.ignoreList.push(obj);
	},

	unIgnore: function (obj) {
		this.ignoreList.spliceWhere(o => o == obj);
	},

	tryEngage: function (obj, amount, threatMult) {
		//Don't aggro yourself, stupid
		if (obj == this.obj)
			return;

		let result = {
			success: true
		};
		this.obj.fireEvent('beforeAggro', result);
		if (!result.success)
			return false;

		//Mobs shouldn't aggro players that are too far from their home
		let mob = this.obj.mob;
		if (!mob)
			mob = obj.mob;
		if (mob) {
			let notMob = (obj == mob) ? this.obj : obj;
			if (!mob.canChase(notMob))
				return false;
		}

		let oId = obj.id;
		let list = this.list;

		amount = amount || 0;
		threatMult = threatMult || 1;

		let exists = list.find(l => l.obj.id == oId);
		if (exists) {
			exists.damage += amount;
			exists.threat += amount * threatMult;
		} else {
			let l = {
				obj: obj,
				damage: amount,
				threat: amount * threatMult
			};

			list.push(l);
		}

		//this.sortThreat();

		return true;
	},

	getFirstAttacker: function () {
		let first = this.list.find(l => ((l.obj.player) && (l.damage > 0)));
		if (first)
			return first.obj;
		return null;
	},

	die: function () {
		let list = this.list;
		let lLen = list.length;

		for (let i = 0; i < lLen; i++) {
			let l = list[i];
			if (!l) {
				lLen--;
				continue;
			}
			//Maybe the aggro component was removed?
			let targetAggro = l.obj.aggro;
			if (targetAggro) {
				targetAggro.unAggro(this.obj);
				i--;
				lLen--;
			}
		}

		this.list = [];
	},
	unAggro: function (obj, amount) {
		let oId = obj.id;
		let list = this.list;
		let lLen = list.length;

		for (let i = 0; i < lLen; i++) {
			let l = list[i];

			if (l.obj != obj)
				continue;

			if (amount == null) {
				list.splice(i, 1);
				obj.aggro.unAggro(this.obj);
				break;
			} else {
				l.threat -= amount;
				if (l.threat <= 0) {
					list.splice(i, 1);
					obj.aggro.unAggro(this.obj);
					break;
				}
			}
		}

		this.ignoreList.spliceWhere(o => o == obj);

		//Stuff like cocoons don't have spellbooks
		if (this.obj.spellbook)
			this.obj.spellbook.unregisterCallback(obj.id, true);

		if ((this.list.length == 0) && (this.obj.mob) && (!this.obj.follower))
			this.obj.stats.resetHp();
	},

	sortThreat: function () {
		this.list.sort(function (a, b) {
			return (b.threat - a.threat);
		});
	},

	getHighest: function () {
		if (this.list.length == 0)
			return null;

		let list = this.list;
		let lLen = list.length;

		let highest = null;
		let closest = 99999;

		let thisObj = this.obj;
		let x = thisObj.x;
		let y = thisObj.y;

		for (let i = 0; i < lLen; i++) {
			let l = list[i];
			var obj = l.obj;

			if (this.ignoreList.some(o => o == obj))
				continue;

			if ((highest == null) || (l.threat > highest.threat)) {
				highest = l;
				closest = Math.max(Math.abs(x - obj.x), Math.abs(y - obj.y));
			} else if (l.threat == highest.threat) {
				let distance = Math.max(Math.abs(x - obj.x), Math.abs(y - obj.y));
				if (distance < closest) {
					highest = l;
					closest = distance;
				}
			}
		}

		if (highest)
			return highest.obj;
		
			//We have aggro but can't reach our target. Don't let the mob run away as if not in combat!
		return true;
	},

	update: function () {
		let list = this.list;
		let lLen = list.length;

		for (let i = 0; i < lLen; i++) {
			let l = list[i];
			if (l.obj.destroyed) {
				this.unAggro(l.obj);
				i--;
				lLen--;
			}
		}
	}
};
