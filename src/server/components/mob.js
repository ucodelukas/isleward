let itemGenerator = require('../items/generator');

let abs = Math.abs.bind(Math);
let rnd = Math.random.bind(Math);
let max = Math.max.bind(Math);

module.exports = {
	type: 'mob',

	target: null,

	physics: null,

	originX: 0,
	originY: 0,

	walkDistance: 1,
	maxChaseDistance: 25,
	goHome: false,

	init: function (blueprint) {
		this.physics = this.obj.instance.physics;

		this.originX = this.obj.x;
		this.originY = this.obj.y;
	},

	update: function () {
		let obj = this.obj;

		let target = null;
		if (obj.aggro)
			target = obj.aggro.getHighest();

		//Have we reached home?
		if (this.goHome) {
			let distanceFromHome = Math.max(Math.abs(this.originX - obj.x), Math.abs(this.originY - obj.y));
			if (distanceFromHome < this.walkDistance)
				this.goHome = false;
		}

		//Are we too far from home?
		if ((!this.goHome) && (!obj.follower) && (target)) {
			if (!this.canChase(target)) {
				obj.clearQueue();
				obj.aggro.unAggro(target);
				target = obj.aggro.getHighest();
			}
		}

		if (!this.goHome) {
			//Are we in fight mode?
			if ((target) && (target !== obj) && ((!obj.follower) || (obj.follower.master !== target))) {
				this.fight(target);
				return;
			}
			//Is fight mode over?
			else if ((!target) && (this.target)) {
				this.target = null;
				obj.clearQueue();
				this.goHome = true;
			}
		}

		//If we're already going somewhere, don't calculate a new path
		if (obj.actionQueue.length > 0)
			return;

		//Unless we're going home, don't always move
		if ((!this.goHome) && (rnd() < 0.85))
			return;

		//don't move around if we're not allowed to, unless we're going home
		let walkDistance = this.walkDistance;
		if ((!this.goHome) && (walkDistance <= 0))
			return;

		let toX = this.originX + ~~(rnd() * (walkDistance * 2)) - walkDistance;
		let toY = this.originY + ~~(rnd() * (walkDistance * 2)) - walkDistance;

		if (!this.physics.isCellOpen(toX, toY))
			return;

		let path = this.physics.getPath({
			x: obj.x,
			y: obj.y
		}, {
			x: toX,
			y: toY
		}, false);

		let pLen = path.length;
		for (let i = 0; i < pLen; i++) {
			let p = path[i];

			obj.queue({
				action: 'move',
				data: {
					x: p.x,
					y: p.y
				}
			});
		}

		//We use goHometo force followers to follow us around but they should never stay in that state
		// since it messes with combat
		if (obj.follower)
			this.goHome = false;
	},
	fight: function (target) {
		if (this.target !== target) {
			this.obj.clearQueue();
			this.target = target;
		}
		//If the target is true, it means we can't reach the target and should wait for a new one
		if (this.target === true)
			return;

		let obj = this.obj;
		let x = obj.x;
		let y = obj.y;

		let tx = ~~target.x;
		let ty = ~~target.y;

		let distance = max(abs(x - tx), abs(y - ty));
		let furthestRange = obj.spellbook.getFurthestRange();
		let doesCollide = null;
		let hasLos = null;

		if (distance <= furthestRange) {
			doesCollide = this.physics.mobsCollide(x, y, obj);
			if (!doesCollide) {
				hasLos = this.physics.hasLos(x, y, tx, ty);
				if (hasLos) {
					if (((obj.follower) && (obj.follower.master.player)) || (rnd() < 0.65)) {
						let spell = obj.spellbook.getRandomSpell(target);
						let success = obj.spellbook.cast({
							spell: spell,
							target: target
						});
						//null means we don't have LoS
						if (success !== null)
							return;
						hasLos = false;
					} else
						return;
				}
			}
		}

		let targetPos = this.physics.getClosestPos(x, y, tx, ty, target);
		if (!targetPos) {
			//Find a new target
			obj.aggro.ignore(target);
			//TODO: Don't skip a turn
			return;
		}
		let newDistance = max(abs(targetPos.x - tx), abs(targetPos.y - ty));

		if ((newDistance >= distance) && (newDistance > furthestRange)) {
			if (hasLos === null)
				hasLos = this.physics.hasLos(x, y, tx, ty);
			if (hasLos) {
				if (doesCollide === null)
					doesCollide = this.physics.mobsCollide(x, y, obj);
				if (!doesCollide) {
					obj.aggro.ignore(target);
					return;
				}
			} else {
				if (doesCollide === null)
					doesCollide = this.physics.mobsCollide(x, y, obj);
				if (!doesCollide) {
					obj.aggro.ignore(target);
					return;
				}
			}
		}

		let path = this.physics.getPath({
			x: x,
			y: y
		}, {
			x: targetPos.x,
			y: targetPos.y
		});
		if (path.length === 0) {
			obj.aggro.ignore(target);
			//TODO: Don't skip a turn
			return;
		}

		let p = path[0];
		obj.queue({
			action: 'move',
			data: {
				x: p.x,
				y: p.y
			}
		});
	},

	canChase: function (obj) {
		let distanceFromHome = Math.max(Math.abs(this.originX - obj.x), Math.abs(this.originY - obj.y));
		return ((!this.goHome) && (distanceFromHome <= this.maxChaseDistance));
	}
};
